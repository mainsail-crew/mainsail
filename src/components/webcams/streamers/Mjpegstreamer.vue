<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <img
            v-show="status === 'connected'"
            ref="image"
            class="webcamImage"
            draggable="false"
            :style="webcamStyle"
            :alt="camSettings.name"
            src="#"
            @load="onload" />
        <span v-if="showFpsCounter && status === 'connected'" class="webcamFpsOutput">
            {{ $t('Panels.WebcamPanel.FPS') }}: {{ fpsOutput }}
        </span>
        <webcam-nozzle-crosshair v-if="showNozzleCrosshair" :webcam="camSettings" />
        <v-row v-if="status !== 'connected'">
            <v-col class="_webcam_mjpegstreamer_output text-center d-flex flex-column justify-center align-center">
                <v-progress-circular v-if="status === 'connecting'" indeterminate color="primary" class="mb-3" />
                <span class="mt-3">{{ statusMessage }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useWebcam } from '@/composables/useWebcam'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamNozzleCrosshair from '@/components/webcams/WebcamNozzleCrosshair.vue'

const CONTENT_LENGTH = 'content-length'

const SOI = new Uint8Array(2)
SOI[0] = 0xff
SOI[1] = 0xd8

const props = defineProps({
    camSettings: { type: Object, required: true },
    printerUrl: { default: null },
    showFps: { type: Boolean, default: true },
    page: { type: String, default: null },
})

const store = useStore()
const { t } = useI18n()
const { convertUrl, getWrapperStyle, generateTransform, updateAspectRatioFromImage, viewport } = useWebcam()

const image = ref<HTMLImageElement | null>(null)

const frames = ref(0)
const currentFPS = ref(0)
const status = ref('connecting')
const statusMessage = ref('')
const streamState = ref(false)
const aspectRatio = ref<number | null>(null)

let timerFPS: number | null = null
let timerRestart: number | null = null
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

const url = computed(() => convertUrl(props.camSettings?.stream_url, props.printerUrl))

const wrapperStyle = computed(() => getWrapperStyle(aspectRatio.value, props.camSettings.rotation))

const webcamStyle = computed(() => ({
    transform: generateTransform(
        props.camSettings.flip_horizontal ?? false,
        props.camSettings.flip_vertical ?? false,
        props.camSettings.rotation ?? 0,
        aspectRatio.value ?? 1
    ),
}))

const fpsOutput = computed(() => currentFPS.value.toString().padStart(2, '0'))

const showFpsCounter = computed(() => {
    if (!props.showFps) return false
    return !(props.camSettings.extra_data?.hideFps ?? false)
})

const expanded = computed(() => {
    if (props.page !== 'dashboard') return true
    return store.getters['gui/getPanelExpand']('webcam-panel', viewport.value) ?? false
})

const showNozzleCrosshair = computed(() => {
    const nozzleCrosshair = props.camSettings.extra_data?.nozzleCrosshair ?? false
    return nozzleCrosshair && status.value === 'connected'
})

watch(expanded, (newExpanded) => {
    if (!newExpanded) {
        stopStream()
        return
    }
    startStream()
}, { immediate: true })

watch(() => props.camSettings, () => {
    aspectRatio.value = null
    restartStream()
}, { deep: true })

function log(msg: string, obj?: unknown) {
    if (obj) {
        window.console.log(`[MJPEG streamer] ${msg}`, obj)
        return
    }
    window.console.log(`[MJPEG streamer] ${msg}`)
}

function getLength(headers: string) {
    let contentLength = -1
    headers.split('\n').forEach((header: string) => {
        const pair = header.split(':')
        if (pair[0].toLowerCase() === CONTENT_LENGTH) {
            contentLength = Number(pair[1])
        }
    })
    return contentLength
}

async function startStream(skipStatus: boolean = false) {
    if (streamState.value) return
    streamState.value = true

    if (!skipStatus) {
        status.value = 'connecting'
        statusMessage.value = t('Panels.WebcamPanel.ConnectingTo', { url: url.value }).toString()
    }

    clearTimeouts()

    try {
        const streamUrl = new URL(url.value)
        streamUrl.searchParams.append('timestamp', new Date().getTime().toString())

        let response: Response | null = await fetch(streamUrl.toString(), { mode: 'cors' })

        if (!response.ok) {
            log(`${response.status}: ${response.statusText}`)
            await stopStream()
            return
        }

        if (!response.body) {
            log('ReadableStream not yet supported in this browser.')
            await stopStream()
            return
        }

        timerFPS = window.setInterval(() => {
            currentFPS.value = frames.value
            frames.value = 0
        }, 1000)

        timerRestart = window.setTimeout(() => {
            restartStream(true)
        }, 10000)

        reader = response.body?.getReader()

        await readStream()

        reader = null
        response = null
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        log(message)
        status.value = 'error'
        statusMessage.value = t('Panels.WebcamPanel.ErrorWhileConnecting', { url: url.value }).toString()

        timerRestart = window.setTimeout(() => {
            restartStream()
        }, 5000)
    }
}

async function readStream() {
    if (!reader) return

    try {
        let headers = ''
        let contentLength = -1
        let imageBuffer: Uint8Array = new Uint8Array(0)
        let bytesRead = 0
        let skipFrame = false

        let done: boolean | null = null
        let value: Uint8Array | undefined

        do {
            ;({ done, value } = await reader!.read())

            if (done || !value) continue

            for (let index = 0; index < value.length; index++) {
                if (value[index] === SOI[0] && value[index + 1] === SOI[1]) {
                    contentLength = getLength(headers)
                    imageBuffer = new Uint8Array(new ArrayBuffer(contentLength))
                }

                if (contentLength <= 0) {
                    headers += String.fromCharCode(value[index])
                    continue
                }

                if (bytesRead < contentLength) {
                    imageBuffer[bytesRead++] = value[index]
                    continue
                }

                if (image.value && !skipFrame) {
                    const objectURL = URL.createObjectURL(new Blob([imageBuffer], { type: 'image/jpeg' }))
                    image.value.src = objectURL
                    skipFrame = true

                    if (status.value !== 'connected') {
                        status.value = 'connected'
                        statusMessage.value = ''
                    }

                    image.value.onload = () => {
                        URL.revokeObjectURL(objectURL)
                        skipFrame = false
                    }
                }
                frames.value++
                contentLength = 0
                bytesRead = 0
                headers = ''
            }
        } while (!done)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        log(`readStream error: ${message}`, error)
    } finally {
        reader?.releaseLock()
    }
}

onMounted(() => {
    document.addEventListener('visibilitychange', documentVisibilityChanged)
})

onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', documentVisibilityChanged)
    stopStream()
})

function clearTimeouts() {
    frames.value = 0
    if (timerFPS) {
        window.clearInterval(timerFPS)
        timerFPS = null
    }
    if (timerRestart) {
        window.clearTimeout(timerRestart)
        timerRestart = null
    }
}

async function stopStream(skipStatus: boolean = false) {
    streamState.value = false

    if (!skipStatus) {
        status.value = 'disconnected'
        statusMessage.value = t('Panels.WebcamPanel.Disconnected').toString()
    }
    clearTimeouts()

    try {
        await reader?.cancel()
        reader?.releaseLock()
        reader = null
    } catch (error) {
        log('Error cancelling reader:', error)
    }
}

async function restartStream(skipStatus: boolean = false) {
    await stopStream(skipStatus)
    await startStream(skipStatus)
}

function documentVisibilityChanged() {
    const visibility = document.visibilityState
    const bool = visibility === 'visible'

    if (props.page === 'dashboard' && !expanded.value) {
        if (!bool) {
            stopStream()
            return
        }
        startStream()
        return
    }

    if (!bool) {
        stopStream()
        return
    }

    startStream()
}

function onload() {
    if (aspectRatio.value !== null) return
    aspectRatio.value = updateAspectRatioFromImage(image.value)
}
</script>

<style scoped>
.webcamFpsOutput {
    display: inline-block;
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    padding: 3px 10px;
    border-top-left-radius: 5px;
}

html.theme--light .webcamFpsOutput {
    background: rgba(255, 255, 255, 0.7);
}

._webcam_mjpegstreamer_output {
    aspect-ratio: calc(3 / 2);
}
</style>
