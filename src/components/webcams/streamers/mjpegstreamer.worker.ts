/// <reference lib="webworker" />

// MJPEG parsing + JPEG decode + canvas rendering, moved off the main thread.
// Stream-reading credit: https://github.com/aruntj/mjpeg-readable-stream

const ctx_self = self as unknown as DedicatedWorkerGlobalScope

const CONTENT_LENGTH = 'content-length'
const SOI = new Uint8Array([0xff, 0xd8])

let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
let canvas: OffscreenCanvas | null = null
let context: OffscreenCanvasRenderingContext2D | null = null
let running = false
let stopping: Promise<void> | null = null
let decoding = false
let connected = false
let lastWidth = 0
let lastHeight = 0

type InMessage = { type: 'init'; canvas: OffscreenCanvas } | { type: 'start'; url: string } | { type: 'stop' }

function getLength(headers: string): number {
    let contentLength = -1
    headers.split('\n').forEach((header: string) => {
        const pair = header.split(':')
        if (pair[0].toLowerCase() === CONTENT_LENGTH) {
            // Fix for https://github.com/aruntj/mjpeg-readable-stream/issues/3
            contentLength = Number(pair[1])
        }
    })
    return contentLength
}

function renderFrame(buffer: Uint8Array) {
    // count every completed frame for the FPS counter, even skipped ones
    ctx_self.postMessage({ type: 'frame' })

    // skip if a previous frame is still decoding, so frames don't pile up
    if (decoding || !context || !canvas) return
    decoding = true

    const blob = new Blob([buffer], { type: 'image/jpeg' })
    createImageBitmap(blob)
        .then((bitmap) => {
            if (!context || !canvas) {
                bitmap.close()
                decoding = false
                return
            }

            const { width, height } = bitmap
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width
                canvas.height = height
            }
            context.drawImage(bitmap, 0, 0)
            bitmap.close()

            if (width !== lastWidth || height !== lastHeight) {
                lastWidth = width
                lastHeight = height
                ctx_self.postMessage({ type: 'size', width, height })
            }

            if (!connected) {
                connected = true
                ctx_self.postMessage({ type: 'connected' })
            }

            decoding = false
        })
        .catch((error: unknown) => {
            decoding = false
            const message = error instanceof Error ? error.message : String(error)
            ctx_self.postMessage({ type: 'log', message: `decode error: ${message}` })
        })
}

async function readStream() {
    if (!reader) return

    let headers = ''
    let contentLength = -1
    let imageBuffer: Uint8Array = new Uint8Array(0)
    let bytesRead = 0

    let done: boolean
    let value: Uint8Array | undefined

    do {
        ;({ done, value } = await reader.read())

        if (done || !value) continue

        for (let index = 0; index < value.length; index++) {
            // start of frame found, everything read until now was the header
            if (value[index] === SOI[0] && value[index + 1] === SOI[1]) {
                contentLength = getLength(headers)
                imageBuffer = new Uint8Array(new ArrayBuffer(contentLength))
            }

            // still reading the header
            if (contentLength <= 0) {
                headers += String.fromCharCode(value[index])
                continue
            }

            // reading the jpeg body
            if (bytesRead < contentLength) {
                imageBuffer[bytesRead++] = value[index]
                continue
            }

            // jpeg complete, render it
            renderFrame(imageBuffer)
            contentLength = 0
            bytesRead = 0
            headers = ''
        }
    } while (!done)
}

async function start(url: string) {
    if (running) return
    running = true
    connected = false
    lastWidth = 0
    lastHeight = 0

    // wait for any in-flight stop() to finish releasing/nulling the previous reader,
    // otherwise it can clobber the new reader we are about to create (restart race)
    if (stopping) await stopping

    try {
        const u = new URL(url)
        u.searchParams.append('timestamp', Date.now().toString())

        const response = await fetch(u.toString(), { mode: 'cors' })

        if (!response.ok) {
            ctx_self.postMessage({ type: 'error', message: `${response.status}: ${response.statusText}` })
            await stop()
            return
        }

        if (!response.body) {
            ctx_self.postMessage({ type: 'error', message: 'ReadableStream not supported in this browser.' })
            await stop()
            return
        }

        reader = response.body.getReader()
        await readStream()
        reader = null
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        ctx_self.postMessage({ type: 'error', message })
    } finally {
        running = false
    }
}

async function stop() {
    running = false
    try {
        await reader?.cancel()
        reader?.releaseLock()
    } catch {
        // reader already released/canceled
    }
    reader = null
    decoding = false
}

ctx_self.onmessage = (event: MessageEvent<InMessage>) => {
    const data = event.data
    switch (data.type) {
        case 'init':
            canvas = data.canvas
            context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | null
            break
        case 'start':
            start(data.url)
            break
        case 'stop':
            stopping = stop()
            break
    }
}
