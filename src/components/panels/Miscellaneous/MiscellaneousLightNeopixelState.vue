<template>
    <span class="_currentState" :style="currentStateStyle" @click="clickButton"></span>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class MiscellaneousLightNeopixelState extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) declare readonly type: string
    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({ type: Number, required: true }) declare readonly index: number

    get printerObject() {
        const printer = this.$store.state.printer ?? {}

        return printer[`${this.type} ${this.name}`] ?? {}
    }

    get colorData() {
        return this.printerObject.color_data ?? []
    }

    get current() {
        const data = this.colorData[this.index - 1] ?? []

        return {
            red: data[0] ?? null,
            green: data[1] ?? null,
            blue: data[2] ?? null,
            white: data[3] ?? null,
        }
    }

    get currentStateStyle() {
        const red = Math.round((this.current.red ?? 0) * 255)
        const green = Math.round((this.current.green ?? 0) * 255)
        const blue = Math.round((this.current.blue ?? 0) * 255)
        const white = Math.round((this.current.white ?? 0) * 255)

        let output = `rgba(${red}, ${green}, ${blue})`

        if (red === 0 && green === 0 && blue === 0 && white > 0) {
            output = `rgb(${white}, ${white}, ${white})`
        }

        return { 'background-color': output }
    }

    clickButton() {
        this.$emit('click-button')
    }
}
</script>

<style scoped>
._currentState {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid lightgray;
    cursor: pointer;
}
</style>
