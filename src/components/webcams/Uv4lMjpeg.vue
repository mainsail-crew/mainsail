<style scoped>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <vue-load-image v-observe-visibility="visibilityChanged">
        <img slot="image" :src="url" alt="Preview" :style="webcamStyle" class="webcamImage" />
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
import {Component, Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {GuiWebcamStateWebcam} from '@/store/gui/webcams/types'

@Component
export default class Uv4lMjpeg extends Mixins(BaseMixin) {
    private isVisible = true

    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam

    @Prop({ default: null }) readonly printerUrl!: string | null

    get url() {
        const baseUrl = this.camSettings.urlStream
        const url = new URL(baseUrl, this.printerUrl === null ? this.hostUrl.toString() : this.printerUrl)

        return decodeURIComponent(url.toString())
    }

    get webcamStyle() {
        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimLeft().length) return {transform: transforms.trimLeft()}

        return ''
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible
    }
}
</script>