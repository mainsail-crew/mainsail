<template>
    <div style="position: relative" class="d-flex justify-center">
        <div v-if="!isLoaded" class="text-center py-5">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <canvas
            ref="mjpegstreamerAdaptive"
            v-observe-visibility="viewportVisibilityChanged"
            width="600"
            height="400"
            :style="webcamStyle"
            :class="'webcamImage ' + (isLoaded ? '' : 'hiddenWebcam')"></canvas>
        <span v-if="isLoaded && showFpsCounter" class="webcamFpsOutput">
            {{ $t('Panels.WebcamPanel.FPS') }}: {{ fpsOutput }}
        </span>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

@Component
export default class MjpegstreamerAdaptive extends Mixins(BaseMixin, WebcamMixin) {
    private refresh = Math.ceil(Math.random() * Math.pow(10, 12))
    private isVisible = true
    private isVisibleDocument = true
    private isVisibleViewport = false
    private isLoaded = true
    // eslint-disable-next-line no-undef
    private timer: NodeJS.Timeout | undefined = undefined

    private request_start_time = performance.now()
    private start_time = performance.now()
    private time = 0
    private request_time = 0
    private time_smoothing = 0.6
    private request_time_smoothing = 0.1
    private currentFPS = 0
    private aspectRatio: null | number = null

    declare $refs: {
        mjpegstreamerAdaptive: any
    }

    @Prop({ required: true }) declare camSettings: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null
    @Prop({ default: true }) declare showFps: boolean

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
        return this.currentFPS < 10 ? '0' + this.currentFPS.toString() : this.currentFPS
    }

    get showFpsCounter() {
        if (!this.showFps) return false

        return !(this.camSettings.extra_data?.hideFps ?? false)
    }

    get rotate() {
        return [90, 270].includes(this.camSettings.rotation ?? 0)
    }

    refreshFrame() {
        if (this.isVisible) {
            this.refresh = new Date().getTime()
            this.setFrame()
        }
    }

    async setFrame() {
        const baseUrl = this.camSettings.snapshot_url

        let url = new URL(baseUrl, this.printerUrl === null ? this.hostUrl.toString() : this.printerUrl)
        if (baseUrl.startsWith('http') || baseUrl.startsWith('://')) url = new URL(baseUrl)

        url.searchParams.append('bypassCache', this.refresh.toString())

        this.request_start_time = performance.now()
        this.currentFPS = this.time > 0 ? Math.round(1000 / this.time) : 0

        let canvas = this.$refs.mjpegstreamerAdaptive
        if (canvas) {
            const ctx = canvas.getContext('2d')
            const frame: any = await this.loadImage(url.toString())

            canvas.width = canvas.clientWidth
            if (this.rotate) {
                if (this.aspectRatio === null) this.aspectRatio = frame.height / frame.width
                canvas.height = canvas.clientWidth / this.aspectRatio
            } else {
                if (this.aspectRatio === null) this.aspectRatio = frame.width / frame.height
                canvas.height = canvas.clientWidth * this.aspectRatio
            }

            if (this.rotate) {
                const scale = canvas.height / frame.width
                const x = canvas.width / 2
                const y = canvas.height / 2
                ctx.translate(x, y)
                ctx.rotate((this.camSettings.rotation * Math.PI) / 180)
                await ctx?.drawImage(
                    frame,
                    (-frame.width / 2) * scale,
                    (-frame.height / 2) * scale,
                    frame.width * scale,
                    frame.height * scale
                )
                ctx.rotate(-((this.camSettings.rotation * Math.PI) / 180))
                ctx.translate(-x, -y)
            } else await ctx?.drawImage(frame, 0, 0, frame.width, frame.height, 0, 0, canvas.width, canvas.height)

            this.isLoaded = true
        }

        this.$nextTick(() => {
            this.onLoad()
        })
    }

    onLoad() {
        this.isLoaded = true

        const targetFps = this.camSettings.target_fps || 10
        const end_time = performance.now()
        const current_time = end_time - this.start_time
        this.time = this.time * this.time_smoothing + current_time * (1.0 - this.time_smoothing)
        this.start_time = end_time

        const target_time = 1000 / targetFps

        const current_request_time = performance.now() - this.request_start_time
        this.request_time =
            this.request_time * this.request_time_smoothing + current_request_time * (1.0 - this.request_time_smoothing)
        const timeout = Math.max(0, target_time - this.request_time)

        this.$nextTick(() => {
            this.timer = setTimeout(this.refreshFrame, timeout)
        })
    }

    loadImage(url: string) {
        return new Promise((r) => {
            let image = new Image()
            image.onload = () => r(image)
            image.onerror = () => setTimeout(this.refreshFrame, 1000)
            image.src = url
        })
    }

    mounted() {
        document.addEventListener('visibilitychange', this.documentVisibilityChanged)
        this.refreshFrame()
    }

    beforeDestroy() {
        document.removeEventListener('visibilitychange', this.documentVisibilityChanged)
    }

    documentVisibilityChanged() {
        const visibility = document.visibilityState
        this.isVisibleDocument = visibility === 'visible'
        if (!this.isVisibleDocument) this.stopStream()
        this.visibilityChanged()
    }

    viewportVisibilityChanged(newVal: boolean) {
        this.isVisibleViewport = newVal
        this.visibilityChanged()
    }

    visibilityChanged() {
        if (this.isVisibleViewport && this.isVisibleDocument) {
            this.startStream()
            return
        }

        this.stopStream()
    }

    startStream() {
        if (this.isVisible) return
        this.isVisible = true
        this.refreshFrame()
    }

    stopStream() {
        this.isVisible = false
        clearTimeout(this.timer)
        this.timer = undefined
    }

    @Watch('camSettings', { immediate: true, deep: true })
    camSettingsChanged() {
        this.aspectRatio = null
    }
}
</script>

<style scoped>
.webcamImage {
    width: 100%;
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
</style>
