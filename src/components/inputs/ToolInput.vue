<style scoped>
    .tool-input {
        min-width: 5rem;
        margin-top: 0;
        padding: 0;
    }

    .tool-input .v-input__slot { margin-bottom: 0; }
    .tool-input .v-text-field__details { display: none; }

    .tool-input input {
        -moz-appearance: textfield;
    }
    .tool-input input::-webkit-outer-spin-button,
    .tool-input input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>

<template>
    <v-combobox
        dense
        hide-details
        v-model="value"
        :items="items"
        item-text="value"
        type="number"
        @keyup.enter="setTemps"
        @keydown.tab="setTemps"
        @change="changeValue"
        @blur="onBlur"
        hide-spin-buttons
    >
    </v-combobox>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins, Prop, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class ToolInput extends Mixins(BaseMixin) {
    private value: any = 0

    @Prop({ type: String, required: true }) readonly name!: string
    @Prop({ type: Number, required: true, default: 0 }) readonly target!: number
    @Prop({ type: Number, required: true }) readonly min_temp!: number
    @Prop({ type: Number, required: true }) readonly max_temp!: number
    @Prop({ type: String, required: true }) readonly command!: string
    @Prop({ type: String, required: true }) readonly attributeName!: string
    @Prop({ type: Array, default: [] }) items!: number[]

    changeValue(newVal: any) {
        if (typeof newVal === 'object') {
            this.setTemps()
        }
    }

    onBlur(event: any) {
        if ('target' in event && event.target && 'value' in event.target) {
            this.value = event.target.value ?? this.value
            this.setTemps()
        }
    }

    setTemps(): void {
        if (typeof this.value === 'object') this.value = this.value.value ?? 0
        if (this.value === null) this.value = 0

        if (this.value > this.max_temp) {
            this.value = { value: this.target, text: this.target }
            this.$toast.error(this.$t('Panels.ToolsPanel.TempTooHigh', { name: this.name, max: this.max_temp })+'')
        } else if (this.value < this.min_temp && this.value != 0) {
            this.value = { value: this.target, text: this.target }
            this.$toast.error(this.$t('Panels.ToolsPanel.TempTooLow', { name: this.name, min: this.min_temp })+'')
        } else if (this.target !== parseFloat(this.value)) {
            const gcode = this.command+' '+this.attributeName+'='+this.name+' TARGET='+this.value
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