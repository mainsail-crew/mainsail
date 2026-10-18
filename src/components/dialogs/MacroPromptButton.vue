<template>
    <v-btn :color="vuetifyColor" :style="computedStyle" class="ma-2" @click="sendCommand">{{ text }}</v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { TinyColor } from '@ctrl/tinycolor'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPrompt } from '@/store/server/types'

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

    /**
     * Any color TinyColor can parse (HEX with or without "#", CSS names, rgb(), hsl(), ...)
     * is used as such. Anything else is kept as a Vuetify theme color name (primary, error, ...).
     */
    get tinyColor(): TinyColor | null {
        if (!this.rawColor) return null

        const color = new TinyColor(this.rawColor)

        return color.isValid ? color : null
    }

    get vuetifyColor() {
        return this.tinyColor ? '' : this.rawColor
    }

    get bgcolor() {
        return this.tinyColor?.toHexString() ?? ''
    }

    get textcolor() {
        if (!this.tinyColor) return ''

        return this.tinyColor.isLight() ? '#212121' : '#ffffff'
    }

    get computedStyle() {
        if (!this.tinyColor) return ''

        return `background-color: ${this.bgcolor} !important; color: ${this.textcolor} !important;`
    }

    sendCommand() {
        this.$store.dispatch('server/addEvent', { message: this.command, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: this.command })
    }
}
</script>
