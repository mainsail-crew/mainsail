<template>
    <v-btn :color="vuetifyColor" :style="computedStyle" class="ma-2" @click="sendCommand">{{ text }}</v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPrompt } from '@/store/server/types'

interface RGB {
    r: number;
    g: number;
    b: number;
}

const HEX_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$|^#?([a-f\d])([a-f\d])([a-f\d])$/i;

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

    get isHex() {
        return HEX_REGEX.test(this.rawColor);
    }

    get vuetifyColor() {
        return this.isHex ? '' : this.rawColor;
    }

    get bgcolor() {
        if (!this.rawColor || !this.isHex) return '';
        return '#' + this.rawColor;
    }

    get computedStyle() {
        let styles = '';
        if (this.bgcolor) {
            styles += `background-color: ${this.bgcolor} !important; `;
        }
        if (this.textcolor) {
            styles += `color: ${this.textcolor} !important; `;
        }
        return styles;
    }

    get textcolor() {
        if (this.bgcolor) {
            const hex = this.hexToRgb(this.bgcolor)
            if (!hex) return ''
            const gray = hex.r * 0.299 + hex.g * 0.587 + hex.b * 0.114
            return gray > 186 ? 'black' : 'white'
        }
        return ''
    }

    hexToRgb(hex: string): RGB | null {
        const match = HEX_REGEX.exec(hex);
        if (!match) return null;

        const r = match[1] ?? (match[4] + match[4]);
        const g = match[2] ?? (match[5] + match[5]);
        const b = match[3] ?? (match[6] + match[6]);

        return {
            r: parseInt(r, 16),
            g: parseInt(g, 16),
            b: parseInt(b, 16)
        };
    }

    sendCommand() {
        this.$store.dispatch('server/addEvent', { message: this.command, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: this.command })
    }
}
</script>
