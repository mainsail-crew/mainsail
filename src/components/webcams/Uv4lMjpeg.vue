<style scoped>
.webcamImage {
    width: 100%;
    background: lightgray;
}
</style>

<template>
    <img ref="webcamUv4lMjpegImage" :src="url" :alt="camSettings.name" :style="webcamStyle" class="webcamImage" />
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

@Component
export default class Uv4lMjpeg extends Mixins(BaseMixin) {
    @Prop({ required: true }) declare readonly camSettings: GuiWebcamStateWebcam
    @Prop({ default: null }) declare readonly printerUrl: string | null

    declare $refs: {
        webcamUv4lMjpegImage: HTMLImageElement
    }

    get url() {
        const baseUrl = this.camSettings.urlStream
        const url = new URL(baseUrl, this.printerUrl === null ? this.hostUrl.toString() : this.printerUrl)

        return decodeURIComponent(url.toString())
    }

    get webcamStyle() {
        const output = {
            transform: 'none',
            aspectRatio: 16 / 9,
        }

        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimStart().length) output.transform = transforms.trimStart()

        if (this.aspectRatio) output.aspectRatio = this.aspectRatio

        return output
    }

    mounted() {
        document.addEventListener('visibilitychange', this.visibilityChanged)
    }

    beforeDestroy() {
        document.removeEventListener('visibilitychange', this.visibilityChanged)
        this.stopStream()
    }

    startStream() {
        if (this.$refs.webcamUv4lMjpegImage) this.$refs.webcamUv4lMjpegImage.setAttribute('src', this.url)
    }

    stopStream() {
        if (this.$refs.webcamUv4lMjpegImage) {
            this.$refs.webcamUv4lMjpegImage.removeAttribute('src')
            URL.revokeObjectURL(this.url)
        }
    }

    visibilityChanged() {
        const visibility = document.visibilityState

        if (visibility === 'visible') {
            this.startStream()
            return
        }

        this.stopStream()
    }
}
</script>
