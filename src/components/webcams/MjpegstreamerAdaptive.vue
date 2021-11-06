<style scoped>
    .webcamFpsOutput {
        display: inline-block;
        position:absolute;
        bottom: 6px;
        right: 0;
        background: rgba(0,0,0,0.8);
        padding: 3px 10px;
        border-top-left-radius: 5px;
    }
</style>

<template>
    <div v-observe-visibility="visibilityChanged" style="position: relative;">
        <div class="text-center py-5" v-if="!isLoaded">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <canvas ref="mjpegstreamerAdaptive" width="600" height="400" :style="webcamStyle" :class="'webcamImage '+(isLoaded ? '' : 'hiddenWebcam')"></canvas>
        <span class="webcamFpsOutput" v-if="isLoaded && showFps">{{ $t('Panels.WebcamPanel.FPS')}}: {{ fpsOutput }}</span>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class MjpegstreamerAdaptive extends Mixins(BaseMixin) {
    private refresh = Math.ceil(Math.random() * Math.pow(10, 12))
    private isVisible = true
    private isLoaded = true
    private timer: number | undefined = undefined

    private request_start_time = performance.now()
    private start_time = performance.now()
    private time = 0
    private request_time = 0
    private time_smoothing = 0.6
    private request_time_smoothing = 0.1
    private currentFPS = 0

    $refs!: {
        mjpegstreamerAdaptive: any
    }

    @Prop({ required: true }) camSettings: any
    @Prop() printerUrl: string | undefined
    @Prop({ default: true }) showFps!: boolean

    get webcamStyle() {
        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimLeft().length) return { transform: transforms.trimLeft() }

        return ''
    }

    get fpsOutput() {
        return (this.currentFPS < 10) ? '0'+this.currentFPS.toString() : this.currentFPS
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible
        if (isVisible) this.refreshFrame()
        else {
            clearTimeout(this.timer)
            this.timer = undefined
        }
    }

    refreshFrame() {
        if (this.isVisible) {
            this.refresh = new Date().getTime()
            this.setFrame()
        }
    }

    onLoad() {
        this.isLoaded = true

        const targetFps = this.camSettings.targetFps || 10
        const end_time = performance.now()
        const current_time = end_time - this.start_time
        this.time = (this.time * this.time_smoothing) + (current_time * (1.0 - this.time_smoothing))
        this.start_time = end_time

        const target_time = 1000 / targetFps

        const current_request_time = performance.now() - this.request_start_time
        this.request_time = (this.request_time * this.request_time_smoothing) + (current_request_time * (1.0 - this.request_time_smoothing))
        const timeout = Math.max(0, target_time - this.request_time)

        this.$nextTick(() => {
            this.timer = setTimeout(this.refreshFrame, timeout)
        })
    }

    async setFrame() {
        const baseUrl = this.camSettings.urlSnapshot
        const url = new URL(baseUrl, this.printerUrl === undefined ? this.hostUrl.toString() : this.printerUrl)

        url.searchParams.append('bypassCache', this.refresh.toString())

        this.request_start_time = performance.now()
        this.currentFPS = (this.time > 0) ? Math.round(1000 / this.time) : 0

        let canvas = this.$refs.mjpegstreamerAdaptive
        if (canvas) {
            const ctx = canvas.getContext('2d')
            const frame: any = await this.loadImage(url.toString())

            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientWidth * (frame.height / frame.width)

            ctx?.drawImage(frame,
                0, 0, frame.width, frame.height,
                0, 0, canvas.width, canvas.height)
            this.isLoaded = true
        }

        this.$nextTick(() => {
            this.onLoad()
        })
    }

    loadImage(url: string) {
        return new Promise(r => {
            let image = new Image()
            image.onload = (() => r(image))
            image.onerror = (() => setTimeout(this.refreshFrame, 1000))
            image.src = url
        })
    }
}
</script>