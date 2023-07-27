<template>
    <div class="d-flex justify-center">
        <img
            ref="webcamUv4lMjpegImage"
            v-observe-visibility="viewportVisibilityChanged"
            :style="webcamStyle"
            class="webcamImage"
            @load="onload" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

@Component
export default class Uv4lMjpeg extends Mixins(BaseMixin, WebcamMixin) {
    private aspectRatio: null | number = null
    private isVisible = false
    private isVisibleViewport = false
    private isVisibleDocument = true

    @Prop({ required: true }) declare readonly camSettings: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null

    declare $refs: {
        webcamUv4lMjpegImage: HTMLImageElement
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

    mounted() {
        document.addEventListener('visibilitychange', this.documentVisibilityChanged)
    }

    beforeDestroy() {
        document.removeEventListener('visibilitychange', this.documentVisibilityChanged)
        this.stopStream()
    }

    startStream() {
        if (this.isVisible) return

        if (this.$refs.webcamUv4lMjpegImage) this.$refs.webcamUv4lMjpegImage.setAttribute('src', this.url)
    }

    stopStream() {
        if (this.$refs.webcamUv4lMjpegImage) {
            this.$refs.webcamUv4lMjpegImage.removeAttribute('src')
            URL.revokeObjectURL(this.url)
        }
    }

    // this function checks if the browser tab was changed
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

    visibilityChanged() {
        if (this.isVisibleViewport && this.isVisibleDocument) {
            this.startStream()
            return
        }

        this.stopStream()
    }

    onload() {
        if (this.aspectRatio === null && this.$refs.webcamUv4lMjpegImage) {
            this.aspectRatio =
                this.$refs.webcamUv4lMjpegImage.naturalWidth / this.$refs.webcamUv4lMjpegImage.naturalHeight
        }
    }

    @Watch('url')
    async urlChanged() {
        await this.stopStream()
        await this.startStream()
    }
}
</script>

<style scoped>
.webcamImage {
    width: 100%;
    background: lightgray;
}
</style>
