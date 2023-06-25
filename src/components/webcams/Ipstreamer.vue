<template>
    <video v-observe-visibility="visibilityChanged" :src="url" autoplay :style="webcamStyle" class="webcamImage" />
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

@Component
export default class Ipstreamer extends Mixins(BaseMixin) {
    private isVisible = true

    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop() printerUrl: string | undefined

    get url() {
        if (!this.isVisible) return ''

        return this.camSettings.stream_url || ''
    }

    get webcamStyle() {
        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flip_horizontal) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flip_vertical) transforms += ' scaleY(-1)'
        if (transforms.trimStart().length) return { transform: transforms.trimStart() }

        return ''
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
