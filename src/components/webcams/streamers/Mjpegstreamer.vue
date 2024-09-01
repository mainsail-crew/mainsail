<template>
    <div style="position: relative" class="d-flex justify-center">
        <img
            ref="image"
            v-observe-visibility="viewportVisibilityChanged"
            class="webcamImage"
            :style="webcamStyle"
            :alt="camSettings.name"
            src="#"
            @load="onload" />
        <span v-if="showFpsCounter" class="webcamFpsOutput">{{ $t('Panels.WebcamPanel.FPS') }}: {{ fpsOutput }}</span>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

const CONTENT_LENGTH = 'content-length'
const TYPE_JPEG = 'image/jpeg'

const SOI = new Uint8Array(2)
SOI[0] = 0xff
SOI[1] = 0xd8

// variables to read the stream
let headers = ''
let contentLength = -1
let imageBuffer: Uint8Array = new Uint8Array(0)
let bytesRead = 0

@Component
export default class Mjpegstreamer extends Mixins(BaseMixin, WebcamMixin) {
    // current read stream frames counter
    frames = 0
    // current displayed fps
    currentFPS = 0
    streamState = false
    aspectRatio: null | number = null
    timerFPS: number | null = null
    timerRestart: number | null = null
    //stream: ReadableStream | null = null
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined = undefined
    isVisibleViewport = false
    isVisibleDocument = true

    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null
    @Prop({ default: true }) declare showFps: boolean

    @Ref('image') readonly image!: HTMLImageElement

    get url() {
        return this.convertUrl(this.camSettings?.stream_url, this.printerUrl)
    }

    get webcamStyle() {
        const output = {
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0
            ),
            aspectRatio: 16 / 9,
            maxHeight: window.innerHeight - 155 + 'px',
            maxWidth: 'auto',
        }

        if (this.aspectRatio) {
            output.aspectRatio = this.aspectRatio
            output.maxWidth = (window.innerHeight - 155) * this.aspectRatio + 'px'
        }

        return output
    }

    get fpsOutput() {
        return this.currentFPS.toString().padStart(2, '0')
    }

    get showFpsCounter() {
        if (!this.showFps) return false

        return !(this.camSettings.extra_data?.hideFps ?? false)
    }

    log(msg: string, obj?: any) {
        if (obj) {
            window.console.log(`[MJPEG streamer] ${msg}`, obj)
            return
        }

        window.console.log(`[MJPEG streamer] ${msg}`)
    }

    getLength(headers: any) {
        let contentLength = -1
        headers.split('\n').forEach((header: any) => {
            const pair = header.split(':')
            if (pair[0].toLowerCase() === CONTENT_LENGTH) {
                // Fix for issue https://github.com/aruntj/mjpeg-readable-stream/issues/3 suggested by martapanc
                contentLength = pair[1]
            }
        })
        return contentLength
    }

    async startStream() {
        if (this.streamState) {
            return
        }
        this.streamState = true

        // reset counter and timeout/interval
        this.clearTimeouts()

        try {
            //readable stream credit to from https://github.com/aruntj/mjpeg-readable-stream
            const response = await fetch(this.url, { mode: 'cors' })

            if (!response.ok) {
                this.log(`${response.status}: ${response.statusText}`)
                await this.stopStream()
                return
            }

            if (!response.body) {
                this.log('ReadableStream not yet supported in this browser.')
                await this.stopStream()
                return
            }

            this.timerFPS = window.setInterval(() => {
                this.currentFPS = this.frames
                this.frames = 0
            }, 1000)

            this.timerRestart = window.setTimeout(() => {
                this.restartStream()
            }, 10000)

            this.reader = response.body?.getReader()
            this.readStream()
        } catch (error: any) {
            this.log(error.message)
        }
    }

    async readStream() {
        // stop if the stream is not ready
        if (!this.reader) return

        try {
            const { done, value } = await this.reader.read()
            if (done) return

            // stop if the stream has no value
            if (!value) {
                this.log('no value')
                this.readStream()
                return
            }

            for (let index = 0; index < value.length; index++) {
                // we've found the start of the frame. Everything we've read till now is the header.
                if (value[index] === SOI[0] && value[index + 1] === SOI[1]) {
                    contentLength = this.getLength(headers)
                    imageBuffer = new Uint8Array(new ArrayBuffer(contentLength))
                }

                // we're still reading the header.
                if (contentLength <= 0) {
                    headers += String.fromCharCode(value[index])
                    continue
                }

                // we're now reading the jpeg.
                if (bytesRead < contentLength) {
                    imageBuffer[bytesRead++] = value[index]
                    continue
                }

                // we're done reading the jpeg. Time to render it.
                const frame = URL.createObjectURL(new Blob([imageBuffer], { type: TYPE_JPEG }))
                this.image.src = frame
                this.image.onload = () => URL.revokeObjectURL(frame)
                this.frames++
                contentLength = 0
                bytesRead = 0
                headers = ''
            }

            this.readStream()
        } catch (error: any) {
            this.log(`readStream error: ${error.message ?? ''}`, error)
        }
    }

    mounted() {
        document.addEventListener('visibilitychange', this.documentVisibilityChanged)
        this.startStream()
    }

    beforeDestroy() {
        document.removeEventListener('visibilitychange', this.documentVisibilityChanged)
        this.stopStream()
    }

    clearTimeouts() {
        this.frames = 0
        if (this.timerFPS) {
            window.clearInterval(this.timerFPS)
            this.timerFPS = null
        }
        if (this.timerRestart) {
            window.clearTimeout(this.timerRestart)
            this.timerRestart = null
        }
    }

    async stopStream() {
        this.streamState = false

        this.clearTimeouts()

        try {
            await this.reader?.cancel()
        } catch (error) {
            this.log('Error cancelling reader:', error)
        } finally {
            this.reader?.releaseLock()
        }
    }

    async restartStream() {
        await this.stopStream()
        await this.startStream()
    }

    @Watch('camSettings', { immediate: true, deep: true })
    camSettingsChanged() {
        this.aspectRatio = null
        this.restartStream()
    }

    // this function check if you changed the browser tab
    documentVisibilityChanged() {
        const visibility = document.visibilityState
        this.isVisibleDocument = visibility === 'visible'
        if (!this.isVisibleDocument) this.stopStream()
        this.visibilityChanged()
    }

    // this function checks if the webcam is in the viewport
    viewportVisibilityChanged(newVal: boolean) {
        this.isVisibleViewport = newVal
        this.visibilityChanged()
    }

    // this function stops the stream on scroll or on collapse of the webcam panel
    visibilityChanged() {
        if (this.isVisibleViewport && this.isVisibleDocument) {
            this.startStream()
            return
        }

        this.stopStream()
    }

    onload() {
        if (this.aspectRatio !== null || !this.image) return

        this.aspectRatio = this.image.naturalWidth / this.image.naturalHeight
    }
}
</script>

<style scoped>
.webcamImage {
    width: 100%;
    background: lightgray;
}

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
</style>
