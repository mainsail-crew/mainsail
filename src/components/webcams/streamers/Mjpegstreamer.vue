<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <canvas
            v-show="status === 'connected'"
            ref="canvas"
            class="webcamImage"
            :style="webcamStyle"
            :aria-label="camSettings.name" />
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
import MjpegWorker from './mjpegstreamer.worker?worker'

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
    worker: Worker | null = null
    canvasTransferred = false
    pendingStart = false

    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null
    @Prop({ default: true }) readonly showFps!: boolean
    @Prop({ type: String, default: null }) readonly page!: string | null
    @Ref() readonly canvas!: HTMLCanvasElement

    get url() {
        return this.convertUrl(this.camSettings?.stream_url, this.printerUrl)
    }

    get wrapperStyle() {
        return this.getWrapperStyle(this.aspectRatio, this.camSettings.rotation)
    }

    get webcamStyle() {
        return {
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0,
                this.aspectRatio ?? 1
            ),
        }
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

    // OffscreenCanvas + Worker rendering needs APIs missing in older browsers (e.g. Safari < 16.4)
    get browserSupported() {
        return (
            typeof OffscreenCanvas !== 'undefined' &&
            typeof createImageBitmap === 'function' &&
            typeof HTMLCanvasElement !== 'undefined' &&
            typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function'
        )
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

    log(msg: string, obj?: unknown) {
        if (obj) {
            window.console.log(`[MJPEG streamer] ${msg}`, obj)
            return
        }

        window.console.log(`[MJPEG streamer] ${msg}`)
    }

    setupWorker() {
        if (this.worker) return

        this.worker = new MjpegWorker()
        this.worker.onmessage = this.onWorkerMessage

        // transferControlToOffscreen can only be called once per canvas element
        if (!this.canvasTransferred && this.canvas) {
            const offscreen = this.canvas.transferControlToOffscreen()
            this.worker.postMessage({ type: 'init', canvas: offscreen }, [offscreen])
            this.canvasTransferred = true
        }
    }

    onWorkerMessage(event: MessageEvent) {
        const data = event.data

        if (!this.streamState) return

        switch (data.type) {
            case 'frame':
                this.frames++
                this.resetRestartTimer()
                break
            case 'size':
                if (data.height) this.aspectRatio = data.width / data.height
                break
            case 'connected':
                this.status = 'connected'
                this.statusMessage = ''
                break
            case 'error':
                this.log(data.message)
                this.status = 'error'
                this.statusMessage = this.$t('Panels.WebcamPanel.ErrorWhileConnecting', { url: this.url }).toString()
                this.streamState = false
                this.timerRestart = window.setTimeout(() => this.restartStream(), 5000)
                break
            case 'log':
                this.log(data.message)
                break
        }
    }

    resetRestartTimer() {
        if (this.timerRestart) window.clearTimeout(this.timerRestart)
        this.timerRestart = window.setTimeout(() => this.restartStream(true), 10000)
    }

    startStream(skipStatus: boolean = false) {
        if (this.streamState) return

        if (!this.browserSupported) {
            this.log('OffscreenCanvas/Worker not supported in this browser.')
            this.status = 'error'
            this.statusMessage = this.$t('Panels.WebcamPanel.BrowserNotSupported').toString()
            return
        }

        // canvas ref is not available before mounted (immediate expanded watch), defer until then
        if (!this.canvas) {
            this.pendingStart = true
            return
        }

        this.streamState = true

        if (!skipStatus) {
            this.status = 'connecting'
            this.statusMessage = this.$t('Panels.WebcamPanel.ConnectingTo', { url: this.url }).toString()
        }

        // reset counter and timeout/interval
        this.clearTimeouts()

        this.setupWorker()

        this.timerFPS = window.setInterval(() => {
            this.currentFPS = this.frames
            this.frames = 0
        }, 1000)
        this.resetRestartTimer()

        this.worker?.postMessage({ type: 'start', url: this.url })
    }

    mounted() {
        document.addEventListener('visibilitychange', this.documentVisibilityChanged)

        if (!this.pendingStart) return

        this.pendingStart = false
        this.startStream()
    }

    beforeDestroy() {
        document.removeEventListener('visibilitychange', this.documentVisibilityChanged)
        this.stopStream()
        this.worker?.terminate()
        this.worker = null
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

    stopStream(skipStatus: boolean = false) {
        this.streamState = false

        if (!skipStatus) {
            this.status = 'disconnected'
            this.statusMessage = this.$t('Panels.WebcamPanel.Disconnected').toString()
        }
        this.clearTimeouts()

        this.worker?.postMessage({ type: 'stop' })
    }

    restartStream(skipStatus: boolean = false) {
        this.stopStream(skipStatus)
        this.startStream(skipStatus)
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
