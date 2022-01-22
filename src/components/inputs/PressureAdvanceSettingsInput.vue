<style scoped>
    ._spin_button_group {
        width: 24px;
        margin: -6px -6px 0 -6px;
    }
</style>

<template>
    <form v-on:submit.prevent="sendCmd">
        <v-text-field
            v-model="value"
            class="d-flex align-center"
            @click:append="resetLimit"
            @blur="value = target"
            :label="label"
            :suffix="unit"
            :append-icon="value !== defaultValue ? 'mdi-restart' : ''"
            :error="error = ((value < min) || ((value > max) && max !== null))"
            :step="step"
            :min="min"
            :max="max"
            :dec="dec"
            type="number"
            hide-spin-buttons
            hide-details
            outlined
            dense
        >
            <template v-if="hasSpinner" v-slot:append-outer>
                <div class="_spin_button_group">
                    <v-btn
                        @click="increment"
                        :disabled="((value >= max) && max !== null) || error"
                        class="mt-n3"
                        icon plain small
                    >
                        <v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn
                        @click="decrement"
                        :disabled="(value <= min) || error"
                        class="mb-n3"
                        icon plain small
                    >
                        <v-icon>mdi-chevron-down</v-icon>
                    </v-btn>
                </div>
            </template>
        </v-text-field>
    </form>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins, Prop, Watch} from 'vue-property-decorator'
import {Debounce} from 'vue-debounce-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class PressureAdvanceSettingsInput extends Mixins(BaseMixin) {
    private value: number = 0
    private error: boolean | undefined

    @Prop({ type: String, required: true }) readonly label!: string
    @Prop({ type: Number, required: false , default: 1 }) readonly step!: number
    @Prop({ type: Boolean, required: false , default: false }) readonly hasSpinner!: number
    @Prop({ type: Number, required: false , default: 1 }) readonly spinnerFactor!: number
    @Prop({ type: Number, required: true , default: 0 }) readonly min!: number
    @Prop({ type: Number, default: null }) readonly max!: number | null
    @Prop({ type: Number, required: true , default: 0 }) readonly dec!: number
    @Prop({ type: Number, required: true, default: 0 }) readonly target!: number
    @Prop({ type: Number, required: true, default: 0 }) readonly defaultValue!: number
    @Prop({ type: String, required: true, default: 'extruder'}) readonly extruder!: string
    @Prop({ type: String, required: true }) readonly attributeName!: string
    @Prop({ type: String, required: true }) readonly unit!: string

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
        this.value = (this.value > this.min) ? Math.round((this.value - this.step * this.spinnerFactor) * (10 ** this.dec)) / (10 ** this.dec) : this.min
        this.sendCmd()
    }

    increment(): void {
        this.value = (this.value < this.max! || this.max === null) ? Math.round((this.value + this.step * this.spinnerFactor) * (10 ** this.dec)) / (10 ** this.dec) : this.max
        this.sendCmd()
    }

    @Debounce(500)
    sendCmd(): void {
        const gcode = 'SET_PRESSURE_ADVANCE ' + 'EXTRUDER=' + this.extruder + ' '
                    + this.attributeName + '=' + Math.max(this.min, this.value).toFixed(this.dec)
        this.$store.dispatch('server/addEvent', {message: gcode, type: 'command'})
        this.$socket.emit('printer.gcode.script', {script: gcode})
    }

}
</script>