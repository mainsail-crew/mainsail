<style scoped>
.webcamImage {
    width: 100%;
}
</style>

<template>
    <video v-observe-visibility="visibilityChanged" :src="url" autoplay :style="webcamStyle" class="webcamImage" />
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class Ipstreamer extends Mixins(BaseMixin) {
    private isVisible = true

    @Prop({ required: true })
    camSettings: any

    @Prop()
    printerUrl: string | undefined

    get url() {
        if (!this.isVisible) return ''

        return this.camSettings.urlStream || ''
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
    }
}
</script>
