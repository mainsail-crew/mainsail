<template>
    <video v-observe-visibility="visibilityChanged" :src="url" autoplay :style="webcamStyle" class="webcamImage" />
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

@Component
export default class Ipstreamer extends Mixins(BaseMixin, WebcamMixin) {
    private isVisible = true

    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null

    get url() {
        return this.convertUrl(this.camSettings?.stream_url, this.printerUrl)
    }

    get webcamStyle() {
        return {
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0
            ),
        }
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible
    }
}
</script>

<style scoped>
.webcamImage {
    width: 100%;
}
</style>
