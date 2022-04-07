<style scoped>
._temp-input {
    font-size: 0.875rem;
    min-width: 5rem;
    max-width: 5rem;
    margin-left: 12px;
}

._temp-input >>> .v-input__slot {
    min-height: 1rem !important;
}

._temp-input >>> .v-text-field__slot input {
    padding: 4px 0 4px;
}

._temp-input >>> .v-input__append-inner {
    margin: auto -5px auto 0 !important;
}
</style>

<template>
    <v-text-field
        v-model="value"
        suffix="°C"
        type="number"
        dense
        outlined
        hide-details
        hide-spin-buttons
        class="_temp-input"
        @blur="value = target"
        @focus="$event.target.select()"
        @keyup.enter="setTemps"></v-text-field>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class TemperatureInput extends Mixins(BaseMixin) {
    private value: any = 0

    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({ type: Number, required: true, default: 0 }) declare readonly target: number
    @Prop({ type: Number, required: true }) declare readonly min_temp: number
    @Prop({ type: Number, required: true }) declare readonly max_temp: number
    @Prop({ type: String, required: true }) declare readonly command: string
    @Prop({ type: String, required: true }) declare readonly attributeName: string
    @Prop({ type: Array, default: [] }) declare items: number[]

    setTemps(): void {
        if (typeof this.value === 'object') this.value = this.value.value ?? 0
        if (this.value === null) this.value = 0

        if (this.value > this.max_temp) {
            this.value = { value: this.target, text: this.target }
            this.$toast.error(
                this.$t('Panels.TemperaturePanel.TempTooHigh', { name: this.name, max: this.max_temp }) + ''
            )
        } else if (this.value < this.min_temp && this.value != 0) {
            this.value = { value: this.target, text: this.target }
            this.$toast.error(
                this.$t('Panels.TemperaturePanel.TempTooLow', { name: this.name, min: this.min_temp }) + ''
            )
        } else if (this.target !== parseFloat(this.value)) {
            const gcode = this.command + ' ' + this.attributeName + '=' + this.name + ' TARGET=' + this.value
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        }
    }

    mounted() {
        this.value = this.target
    }

    @Watch('target')
    targetChanged(newVal: number): void {
        this.value = newVal
    }
}
</script>
