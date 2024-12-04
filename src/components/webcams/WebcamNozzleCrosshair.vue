<template>
    <div ref="container" class="crosshair-container">
        <div class="line horizontal" :style="styleLines" />
        <div class="line vertical" :style="styleLines" />
        <div class="circle" :style="styleCircle" />
        <resize-observer @notify="handleResize" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Ref } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

@Component
export default class WebcamWrapper extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) webcam!: GuiWebcamStateWebcam
    @Ref() container!: HTMLDivElement

    clientHeight = 0

    get color() {
        return this.webcam.extra_data?.nozzleCrosshairColor ?? '#ff0000'
    }

    get styleLines() {
        return {
            backgroundColor: this.color,
        }
    }

    get styleCircle() {
        const nozzleCrosshairSize = this.webcam.extra_data?.nozzleCrosshairSize ?? 0.1
        const size = this.clientHeight * nozzleCrosshairSize

        return {
            borderColor: this.color,
            width: `${size}px`,
            height: `${size}px`,
            marginLeft: `-${size / 2}px`,
            marginTop: `-${size / 2}px`,
        }
    }

    mounted() {
        this.handleResize()
    }

    handleResize() {
        this.$nextTick(() => {
            this.clientHeight = this.container.clientHeight
        })
    }
}
</script>

<style scoped>
.crosshair-container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.line {
    position: absolute;
    background-color: #ff0000;
}

.horizontal {
    height: 1px;
    top: 50%;
    left: 0;
    right: 0;
}

.vertical {
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
}

.circle {
    position: absolute;
    border: 1px solid #ff0000;
    border-radius: 50%;
    box-sizing: border-box;
    top: 50%;
    left: 50%;
}
</style>
