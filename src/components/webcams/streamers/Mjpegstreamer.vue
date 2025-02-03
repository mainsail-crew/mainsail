<template>
    <div style="position: relative" class="d-flex justify-center">
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

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

const CONTENT_LENGTH = 'content-length'

const SOI = new Uint8Array(2)
SOI[0] = 0xff
SOI[1] = 0xd8

@Component
export default class Mjpegstreamer extends Mixins(BaseMixin, WebcamMixin) {
    // current read stream frames counter
    frames = 0
    // current displayed fps
    currentFPS = 0
    status: string = 'connecting'
    statusMessage: string = ''
    streamState = false
    aspectRatio: null | number = null
    timerFPS: number | null = null
    timerRestart: number | null = null

    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null
    @Prop({ default: true }) declare showFps: boolean
    @Prop({ type: String, default: null }) readonly page!: string | null

    @Ref('image') readonly image!: HTMLImageElement

    private reader: ReadableStreamDefaultReader<Uint8Array> | null
    constructor() {
        super()
        this.reader = null
    }

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

    get expanded(): boolean {
        if (this.page !== 'dashboard') return true

        return this.$store.getters['gui/getPanelExpand']('webcam-panel', this.viewport) ?? false
    }

    get showNozzleCrosshair() {
        const nozzleCrosshair = this.camSettings.extra_data?.nozzleCrosshair ?? false

        return nozzleCrosshair && this.status === 'connected'
    }

    // start or stop the video when the expanded state changes
    @Watch('expanded', { immediate: true })
    expandChanged(newExpanded: boolean): void {
        if (!newExpanded) {
            this.stopStream()
            return
        }

        this.startStream()
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

    async startStream(skipStatus: boolean = false) {
        if (this.streamState) {
            return
        }
        this.streamState = true

        if (!skipStatus) {
            this.status = 'connecting'
            this.statusMessage = this.$t('Panels.WebcamPanel.ConnectingTo', { url: this.url }).toString()
        }

        // reset counter and timeout/interval
        this.clearTimeouts()

        try {
            //readable stream credit to from https://github.com/aruntj/mjpeg-readable-stream

            const url = new URL(this.url)
            url.searchParams.append('timestamp', new Date().getTime().toString())

            let response: Response | null = await fetch(url.toString(), { mode: 'cors' })

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
                this.restartStream(true)
            }, 10000)

            this.reader = response.body?.getReader()

            await this.readStream()

            // cleanup
            this.reader = null
            response = null
        } catch (error: any) {
            this.log(error.message)
            this.status = 'error'
            this.statusMessage = this.$t('Panels.WebcamPanel.ErrorWhileConnecting', { url: this.url }).toString()

            this.timerRestart = window.setTimeout(() => {
                this.restartStream()
            }, 5000)
        }
    }

    async readStream() {
        // stop if the stream is not ready
        if (!this.reader) return

        try {
            // variables to read the stream
            let headers = ''
            let contentLength = -1
            let imageBuffer: Uint8Array = new Uint8Array(0)
            let bytesRead = 0
            let skipFrame = false

            let done: boolean | null = null
            let value

            do {
                ;({ done, value } = await this.reader.read())

                if (done || !value) continue

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
                    if (this.image && !skipFrame) {
                        const objectURL = URL.createObjectURL(new Blob([imageBuffer], { type: 'image/jpeg' }))
                        this.image.src = objectURL
                        skipFrame = true

                        // update status to 'connected' if the first frame is received
                        if (this.status !== 'connected') {
                            this.status = 'connected'
                            this.statusMessage = ''
                        }

                        this.image.onload = () => {
                            URL.revokeObjectURL(objectURL)
                            skipFrame = false
                        }
                    }
                    this.frames++
                    contentLength = 0
                    bytesRead = 0
                    headers = ''
                }
            } while (!done)
        } catch (error: any) {
            this.log(`readStream error: ${error.message ?? ''}`, error)
        } finally {
            this.reader?.releaseLock()
        }
    }

    mounted() {
        document.addEventListener('visibilitychange', this.documentVisibilityChanged)
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

    async stopStream(skipStatus: boolean = false) {
        this.streamState = false

        if (!skipStatus) {
            this.status = 'disconnected'
            this.statusMessage = this.$t('Panels.WebcamPanel.Disconnected').toString()
        }
        this.clearTimeouts()

        try {
            await this.reader?.cancel()
            this.reader?.releaseLock()
            this.reader = null
        } catch (error) {
            this.log('Error cancelling reader:', error)
        }
    }

    async restartStream(skipStatus: boolean = false) {
        await this.stopStream(skipStatus)
        await this.startStream(skipStatus)
    }

    @Watch('camSettings', { deep: true })
    camSettingsChanged() {
        this.aspectRatio = null
        this.restartStream()
    }

    // this function check if you changed the browser tab
    documentVisibilityChanged() {
        const visibility = document.visibilityState
        let bool = visibility === 'visible'

        if (this.page === 'dashboard' && !this.expanded) {
            bool = false
        }

        if (!bool) {
            this.stopStream()
            return
        }

        this.startStream()
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

._webcam_mjpegstreamer_output {
    aspect-ratio: calc(3 / 2);
}
</style>
