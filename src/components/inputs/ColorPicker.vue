<template>
    <div>
        <div ref="picker"></div>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import iro from '@jaames/iro'
import { IroColor } from '@irojs/iro-core'
import { ColorPickerProps, IroColorPicker as IroCP } from '@jaames/iro/dist/ColorPicker.d'

@Component
export default class ColorPicker extends Mixins(BaseMixin) {
    colorPicker: IroCP | null = null

    @Ref('picker')
    readonly picker!: HTMLElement

    @Prop({ type: [Object, String], default: '#ffffff' })
    readonly color!: IroColor

    @Prop({ type: Object, default: () => ({}) })
    readonly options!: ColorPickerProps

    @Watch('color', { deep: true })
    colorChanged(value: string) {
        if (this.colorPicker && this.colorPicker.color.rgbString !== value) {
            this.colorPicker.color.rgbString = value
        }
    }

    get internalOptions(): ColorPickerProps {
        return {
            ...this.options,
            color: this.color,
            borderWidth: 2,
            sliderSize: 16,
        }
    }

    emitColorChange(color: IroColor) {
        this.$emit('change', color)
        this.$emit('update:color', color)
    }

    onColorChange(color: IroColor) {
        this.emitColorChange(color)
    }

    mounted() {
        this.colorPicker = iro.ColorPicker(this.picker, this.internalOptions)
        this.colorPicker.on('color:change', this.onColorChange)
    }

    beforeDestroy() {
        this.colorPicker?.off('color:change', this.onColorChange)
    }
}
</script>

<style scoped></style>
