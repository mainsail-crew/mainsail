<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video
            ref="video"
            :src="url"
            autoplay
            :style="webcamStyle"
            class="webcamImage"
            @loadedmetadata="onLoadedMetadata" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

@Component
export default class HtmlVideo extends Mixins(BaseMixin, WebcamMixin) {
    aspectRatio: number | null = null

    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null

    @Ref('video') readonly video!: HTMLVideoElement
    get url() {
        return this.convertUrl(this.camSettings?.stream_url, this.printerUrl)
    }

    get wrapperStyle() {
        if (this.aspectRatio !== null && this.aspectRatio < 1 && [90, 270].includes(this.camSettings.rotation)) {
            return {
                aspectRatio: 1 / this.aspectRatio,
                maxHeight: `${window.innerHeight - 155}px`,
            }
        }

        return {
            maxHeight: `${window.innerHeight - 155}px`,
        }
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

    onLoadedMetadata() {
        const w = this.video?.videoWidth
        const h = this.video?.videoHeight

        if (!w || !h) {
            this.aspectRatio = null
            return
        }

        this.aspectRatio = w / h
    }
}
</script>
