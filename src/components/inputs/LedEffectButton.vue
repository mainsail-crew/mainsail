<template>
    <v-btn
        :color="buttonColor"
        :loading="loadings.includes(`led_effect_${effect.name}`)"
        :disabled="printerIsPrintingOnly"
        class="text-uppercase mr-1 mb-1"
        small
        @click="toggleEffect">
        {{ effect.name }}
    </v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { PrinterStateLedEffect } from '@/store/printer/types'

@Component
export default class LedEffectButton extends Mixins(BaseMixin) {
    @Prop({ required: true })
    declare readonly effect: PrinterStateLedEffect

    @Prop({ default: 'primary' })
    declare readonly color: string

    get buttonColor() {
        return this.effect.is_enabled ? 'success' : this.color
    }

    get toggleCommand() {
        if (this.effect.is_enabled) {
            // Disable effect: SET_LED_EFFECT EFFECT="name" STOP=1
            return `SET_LED_EFFECT EFFECT="${this.effect.name}" STOP=1`
        } else {
            // Enable effect: SET_LED_EFFECT EFFECT="name" (no STOP)
            return `SET_LED_EFFECT EFFECT="${this.effect.name}"`
        }
    }

    toggleEffect() {
        const command = this.toggleCommand
        this.$store.dispatch('server/addEvent', { message: command, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: command }, { loading: `led_effect_${this.effect.name}` })
    }
}
</script>