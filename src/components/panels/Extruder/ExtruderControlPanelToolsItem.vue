<template>
    <v-btn
        :disabled="printerIsPrintingOnly"
        dense
        class="flex-grow-1 px-0"
        :style="buttonStyle"
        @click="doSend(macro.name)">
        <span v-if="color != null" class="_extruderColorState mr-1" :style="dotStyle" />
        {{ macro.name }}
    </v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { PrinterStateMacro } from '@/store/printer/types'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'

@Component({
    components: {},
})
export default class ExtruderControlPanel extends Mixins(BaseMixin, ControlMixin) {
    @Prop({ type: Object }) macro!: PrinterStateMacro

    get active() {
        return this.macro.variables.active ?? false
    }

    get color() {
        const color = this.macro.variables.color ?? this.macro.variables.colour ?? null
        if (color === '' || color === 'undefined') return null

        return color
    }

    get primaryColor(): string {
        return this.$store.state.gui.uiSettings.primary
    }

    get primaryTextColor(): string {
        let splits = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.primaryColor)
        if (splits) {
            const r = parseInt(splits[1], 16) * 0.2126
            const g = parseInt(splits[2], 16) * 0.7152
            const b = parseInt(splits[3], 16) * 0.0722
            const perceivedLightness = (r + g + b) / 255

            return perceivedLightness > 0.7 ? '#222' : '#fff'
        }

        return '#ffffff'
    }

    get warningColor(): string {
        return this.$vuetify?.theme?.currentTheme?.warning?.toString() ?? '#ff8300'
    }

    get buttonStyle() {
        let backgroundColor = ''
        if (this.active) {
            backgroundColor = this.homedAxes.includes('xyz') ? this.primaryColor : this.warningColor
        }

        const textColor = this.active ? this.primaryTextColor : ''

        return {
            color: textColor,
            'background-color': backgroundColor,
        }
    }

    get dotStyle() {
        return {
            'border-color': this.active ? this.primaryTextColor : '',
            'background-color': '#' + this.color,
        }
    }
}
</script>

<style lang="scss" scoped>
._extruderColorState {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid lightgray;
}
</style>
