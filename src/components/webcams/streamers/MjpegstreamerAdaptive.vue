<template>
    <div v-observe-visibility="viewportVisibilityChanged" class="d-flex justify-center webcamBackground">
        <img
            v-show="status === 'connected'"
            ref="image"
            class="webcamImage"
            draggable="false"
            :style="webcamStyle"
            :alt="camSettings.name"
            src="#"
            @error="onError"
            @load="onLoad" />
        <span v-if="status === 'connected' && showFpsCounter" class="webcamFpsOutput">
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

@Component
export default class MjpegstreamerAdaptive extends Mixins(BaseMixin, WebcamMixin) {
    isVisibleDocument = true
    isVisibleViewport = false
    status: string = 'connecting'
    statusMessage: string = ''

    timer: number | null = null
    request_start_time = performance.now()
    time = 0
    request_time = 0
    request_time_smoothing = 0.2

    currentFPS: number | null = null
    fpsTimer: number | null = null
    frames = 0

    aspectRatio: null | number = null

    @Prop({ required: true }) declare camSettings: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null
    @Prop({ default: true }) declare showFps: boolean

    @Ref('image') readonly image!: HTMLImageElement

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

        if (this.aspectRatio && [90, 270].includes(this.camSettings.rotation)) {
            if (output.transform === 'none') output.transform = ''

            const scale = 1 / this.aspectRatio
            output.transform += ' rotate(' + this.camSettings.rotation + 'deg) scale(' + scale + ')'
        }

        return output
    }

    get fpsOutput() {
        if (this.currentFPS === null) return '--'

        return this.currentFPS < 10 ? '0' + this.currentFPS.toString() : this.currentFPS
    }

    get showFpsCounter() {
        if (!this.showFps) return false

        return !(this.camSettings.extra_data?.hideFps ?? false)
    }

    get url() {
        return this.convertUrl(this.camSettings?.snapshot_url, this.printerUrl)
    }

    get isVisible() {
        return this.isVisibleDocument && this.isVisibleViewport
    }

    get showNozzleCrosshair() {
        const nozzleCrosshair = this.camSettings.extra_data?.nozzleCrosshair ?? false

        return nozzleCrosshair && this.status === 'connected'
    }

    mounted() {
        document.addEventListener('visibilitychange', this.documentVisibilityChanged)
    }

    beforeDestroy() {
        document.removeEventListener('visibilitychange', this.documentVisibilityChanged)
        this.stopStream()
    }

    documentVisibilityChanged() {
        const visibility = document.visibilityState
        this.isVisibleDocument = visibility === 'visible'
    }

    viewportVisibilityChanged(newVal: boolean) {
        this.isVisibleViewport = newVal
    }

    @Watch('isVisible', { immediate: true })
    isVisibleChanged(newVal: boolean) {
        if (newVal) {
            this.startStream()
            return
        }

        this.stopStream()
    }

    refreshFrame() {
        if (!this.isVisible) return

        if (this.timer !== null) {
            window.clearTimeout(this.timer)
            this.timer = null
        }

        const url = new URL(this.url)
        url.searchParams.append('bypassCache', new Date().getTime().toString())
        this.image.src = url.toString()
        this.request_start_time = performance.now()
    }

    onLoad() {
        if (this.status !== 'connected') {
            this.status = 'connected'
            this.statusMessage = ''
        }
        this.frames++

        if (this.aspectRatio === null) {
            this.aspectRatio = this.image.naturalWidth / this.image.naturalHeight
        }

        const targetFps = this.camSettings.target_fps || 10
        const target_time = 1000 / targetFps

        const current_request_time = performance.now() - this.request_start_time
        this.request_time =
            this.request_time * this.request_time_smoothing + current_request_time * (1 - this.request_time_smoothing)
        const timeout = Math.max(0, target_time - this.request_time)

        this.timer = window.setTimeout(this.refreshFrame, timeout)
    }

    onError() {
        this.status = 'error'
        this.statusMessage = this.$t('Panels.WebcamPanel.ErrorWhileConnecting', { url: this.url }).toString()

        if (this.timer !== null) return

        this.timer = window.setTimeout(this.refreshFrame, 1000)
    }

    startStream() {
        // is not visible or already streaming
        if (!this.isVisible) return

        if (this.status !== 'connected') {
            this.status = 'connecting'
            this.statusMessage = this.$t('Panels.WebcamPanel.ConnectingTo', { url: this.url }).toString()
        }

        this.clearTimers()

        this.fpsTimer = window.setInterval(() => {
            this.currentFPS = this.frames
            this.frames = 0
        }, 1000)

        this.refreshFrame()
    }

    stopStream() {
        this.clearTimers()
    }

    clearTimers() {
        if (this.timer) {
            window.clearTimeout(this.timer)
            this.timer = null
        }

        if (this.fpsTimer) {
            window.clearTimeout(this.fpsTimer)
            this.fpsTimer = null
            this.frames = 0
        }
    }

    @Watch('camSettings', { deep: true })
    camSettingsChanged() {
        this.aspectRatio = null
        this.stopStream()

        this.status = 'connecting'

        this.startStream()
    }
}
</script>

<style scoped>
.webcamBackground {
    position: relative;
    background: rgba(0, 0, 0, 0.8);
}

.webcamImage {
    width: 100%;
}

._webcam_mjpegstreamer_output {
    aspect-ratio: calc(3 / 2);
}

.webcamFpsOutput {
    display: inline-block;
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 3px 10px;
    border-top-left-radius: 5px;
    background: rgba(0, 0, 0, 0.8);
}

html.theme--light .webcamBackground {
    background: rgba(255, 255, 255, 0.7);
}

html.theme--light .webcamFpsOutput {
    background: rgba(255, 255, 255, 0.7);
}
</style>
