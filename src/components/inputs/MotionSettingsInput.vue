<style scoped>
._spin_button_group {
    width: 24px;
    margin: -6px -6px 0 -6px;
}
</style>

<template>
    <form @submit.prevent="sendCmd">
        <v-text-field
            v-model="value"
            class="d-flex align-center"
            :label="label"
            :suffix="unit"
            :append-icon="value !== defaultValue ? 'mdi-restart' : ''"
            :error="(error = value < min || (value > max && max !== null))"
            :step="step"
            :min="min"
            :max="max"
            :dec="dec"
            type="number"
            @click:append="resetLimit"
            hide-spin-buttons
            @blur="value = target"
            hide-details
            outlined
            dense>
            <template v-if="hasSpinner" #append-outer>
                <div class="_spin_button_group">
                    <v-btn
                        :disabled="(value >= max && max !== null) || error"
                        class="mt-n3"
                        icon
                        plain
                        small
                        @click="increment">
                        <v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn :disabled="value <= min || error" class="mb-n3" icon plain small @click="decrement">
                        <v-icon>mdi-chevron-down</v-icon>
                    </v-btn>
                </div>
            </template>
        </v-text-field>
    </form>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class MotionSettingsInput extends Mixins(BaseMixin) {
    private value: number = 0
    private error: boolean | undefined

    @Prop({ type: String, required: true }) declare readonly label: string
    @Prop({ type: Number, required: false, default: 1 }) declare readonly step: number
    @Prop({ type: Boolean, required: false, default: false }) declare readonly hasSpinner: number
    @Prop({ type: Number, required: false, default: 1 }) declare readonly spinnerFactor: number
    @Prop({ type: Number, required: true, default: 0 }) declare readonly min: number
    @Prop({ type: Number, default: null }) declare readonly max: number | null
    @Prop({ type: Number, required: true, default: 0 }) declare readonly dec: number
    @Prop({ type: Number, required: true, default: 0 }) declare readonly target: number
    @Prop({ type: Number, required: true, default: 0 }) declare readonly defaultValue: number
    @Prop({ type: String, required: true }) declare readonly attributeName: string
    @Prop({ type: String, required: true }) declare readonly unit: string

    @Watch('target')
    targetChanged(newVal: number): void {
        this.value = newVal
    }

    created(): void {
        this.value = this.target
    }

    resetLimit(): void {
        this.value = this.defaultValue

        this.sendCmd()
    }

    decrement(): void {
        this.value =
            this.value > this.min
                ? Math.round((this.value - this.step * this.spinnerFactor) * 10 ** this.dec) / 10 ** this.dec
                : this.min
        this.sendCmd()
    }

    increment(): void {
        this.value =
            this.value < this.max! || this.max === null
                ? Math.round((this.value + this.step * this.spinnerFactor) * 10 ** this.dec) / 10 ** this.dec
                : this.max
        this.sendCmd()
    }

    @Debounce(500)
    sendCmd(): void {
        const gcode =
            'SET_VELOCITY_LIMIT ' + this.attributeName + '=' + Math.max(this.min, this.value).toFixed(this.dec)
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
