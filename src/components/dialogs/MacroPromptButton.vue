<template>
    <v-btn :color="vuetifyColor" :style="computedStyle" class="ma-2" @click="sendCommand">{{ text }}</v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPrompt } from '@/store/server/types'
import { convertHexToRgb, filamentTextColor } from '@/plugins/helpers'

@Component({})
export default class MacroPromptButton extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly event!: ServerStateEventPrompt

    get splits() {
        return this.event.message.split('|')
    }

    get text() {
        return this.splits[0]
    }

    get command() {
        return this.splits[1] ?? this.text
    }

    get rawColor() {
        return this.splits[2]?.trim() ?? ''
    }

    get vuetifyColor() {
        return this.bgcolor ? '' : this.rawColor
    }

    get bgcolor() {
        const hex = this.rawColor.replace(/^#/, '')

        // only 3 or 6 digits are supported (no alpha), convertHexToRgb validates the characters
        if (![3, 6].includes(hex.length) || convertHexToRgb(hex) === null) return ''

        // expand 3-digit shorthand (f00 -> ff0000), filamentTextColor only understands 6/8 digits
        return '#' + (hex.length === 3 ? hex.replace(/./g, '$&$&') : hex)
    }

    get textcolor() {
        return this.bgcolor ? filamentTextColor(this.bgcolor) : ''
    }

    get computedStyle() {
        if (!this.bgcolor) return {}

        return {
            backgroundColor: this.bgcolor,
            color: this.textcolor,
        }
    }

    sendCommand() {
        this.$store.dispatch('server/addEvent', { message: this.command, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: this.command })
    }
}
</script>
