<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <iframe class="webcamImage" :src="url" :style="iframeStyle" :title="camSettings.name" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

@Component
export default class HtmlIframe extends Mixins(BaseMixin, WebcamMixin) {
    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null

    get url() {
        return this.convertUrl(this.camSettings?.stream_url, this.printerUrl)
    }

    get wrapperStyle() {
        return this.getWrapperStyle(null, this.camSettings.rotation)
    }

    get iframeAspectRatio() {
        const value = this.camSettings.aspect_ratio?.trim()
        if (!value) return null

        const match = value.match(/^(\d+)\s*[:/]\s*(\d+)$/)
        if (!match) return null

        return `${match[1]} / ${match[2]}`
    }

    get iframeStyle() {
        return {
            border: 'none',
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0
            ),
            'aspect-ratio': this.iframeAspectRatio || '16:9',
        }
    }
}
</script>
