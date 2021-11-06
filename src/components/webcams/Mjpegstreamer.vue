<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <vue-load-image v-observe-visibility="visibilityChanged" ref="imageLoader" onload="resetImageRatio">
        <img slot="image" :src="url" alt="Preview" :style="webcamStyle" class="webcamImage" ref="webcamImage" />
        <div slot="preloader" class="text-center py-5">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <div slot="error" class="text-center py-5">
            <v-icon x-large>mdi-webcam-off</v-icon>
            <div class="subtitle-1 mt-2">{{ $t('Panels.WebcamPanel.UrlNotAvailable') }}</div>
        </div>
    </vue-load-image>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class Mjpegstreamer extends Mixins(BaseMixin) {
    private isVisible = true
    private refresh = Math.ceil(Math.random() * Math.pow(10, 12))
    private imageRatio = 0

    @Prop({ required: true })
    camSettings: any

    @Prop()
    printerUrl: string | undefined

    $refs!: {
        imageLoader: any,
        webcamImage: HTMLImageElement,
    }

    get url() {
        const baseUrl = this.camSettings.urlStream
        const url = new URL(baseUrl, this.printerUrl === undefined ? this.hostUrl.toString() : this.printerUrl)
        url.searchParams.append('bypassCache', this.refresh.toString())

        return decodeURIComponent(url.toString())
    }

    get webcamStyle() {
        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimLeft().length) return { transform: transforms.trimLeft() }

        return ''
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible

        if (isVisible) {
            this.refresh = Math.ceil(Math.random() * Math.pow(10, 12))
        } else {
            const width = this.$refs.webcamImage?.width ?? 0
            const height = this.$refs.webcamImage?.height ?? 0
            this.imageRatio = (width && height) ? width/height : 0
            this.resize()
        }
    }

    mounted() {
        window.addEventListener('resize', this.resize)
    }

    beforeDestroy() {
        window.removeEventListener('resize', this.resize)
    }

    resize() {
        if (this.imageRatio && this.$refs.imageLoader?.$el) {
            this.$refs.imageLoader.$el.style.height = Math.round(this.$refs.imageLoader.$el.clientWidth / this.imageRatio)+'px'
        }
    }

    resetImageRatio() {
        this.imageRatio = 0
    }
}
</script>