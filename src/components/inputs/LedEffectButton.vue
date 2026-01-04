<template>
    <v-btn
        :color="buttonColor"
        :loading="isLoading"
        :disabled="printerIsPrintingOnly"
        class="text-uppercase"
        small
        @click="toggleEffect">
        {{ name }}
    </v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

interface LedEffectState {
    enabled: boolean
}

@Component
export default class LedEffectButton extends Mixins(BaseMixin) {
    @Prop({ required: true }) readonly name!: string

    get ledEffectState(): LedEffectState | undefined {
        const printer = this.$store.state.printer ?? {}
        const objectKey = `led_effect ${this.name}`

        return printer[objectKey]
    }

    get isEnabled() {
        return this.ledEffectState?.enabled ?? false
    }

    get buttonColor() {
        return this.isEnabled ? 'success' : 'primary'
    }

    get loadingKey() {
        return `led_effect_${this.name}`
    }

    get isLoading() {
        return this.loadings.includes(this.loadingKey)
    }

    toggleEffect() {
        let command = `SET_LED_EFFECT EFFECT="${this.name}"`
        if (this.isEnabled) command += ' STOP=1'

        this.$store.dispatch('server/addEvent', { message: command, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: command }, { loading: this.loadingKey })
    }
}
</script>
