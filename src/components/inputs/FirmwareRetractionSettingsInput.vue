<template>
    <form v-on:submit.prevent="sendCmd">
        <v-text-field
            v-model="value"
            @click:append="resetLimit"
            :label="label"
            :suffix="unit"
            :append-icon="this.value !== this.defaultValue ? 'mdi-refresh' : ''"
            :error="this.value < 0"
            :step="step"
            type="number"
            min="0"
            hide-spin-buttons
            hide-details
            outlined
            dense
        ></v-text-field>
    </form>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins, Prop, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class FirmwareRetractionSettingsInput extends Mixins(BaseMixin) {
    private value: any = 0

    @Prop({ type: String, required: true }) readonly label!: string
    @Prop({ type: Number, required: false }) readonly step!: string
    @Prop({ type: Number, required: true, default: 0 }) readonly target!: number
    @Prop({ type: Number, required: true, default: 0 }) readonly defaultValue!: number
    @Prop({ type: String, required: true }) readonly attributeName!: string
    @Prop({ type: String, required: true }) readonly unit!: string

    @Watch('target')
    targetChanged(newVal: number): void {
        this.value = newVal
    }

    created(): void {
        this.value = this.target
    }

    resetLimit() {
        this.value = this.defaultValue

        this.sendCmd()
    }

    sendCmd() {
        const gcode = 'SET_RETRACTION ' + this.attributeName + '=' + Math.max(0, this.value).toFixed(2)
        this.$store.dispatch('server/addEvent', {message: gcode, type: 'command'})
        this.$socket.emit('printer.gcode.script', {script: gcode})
    }

}
</script>