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
        onClick="this.select();"
        v-model="value"
        :items="items"
        item-text="value"
        type="number"
        @change="setTemps"
    ></v-combobox>
</template>

<script lang="ts">
import Component from "vue-class-component";
import {Mixins, Prop, Watch} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";

@Component
export default class ToolInput extends Mixins(BaseMixin) {
    private value = 0

    @Prop({ type: String, required: true }) readonly name!: string
    @Prop({ type: Number, required: true, default: 0 }) readonly target!: number
    @Prop({ type: Number, required: true }) readonly min_temp!: number
    @Prop({ type: Number, required: true }) readonly max_temp!: number
    @Prop({ type: String, required: true }) readonly command!: string
    @Prop({ type: String, required: true }) readonly attributeName!: string
    @Prop({ type: Array, default: [] }) items!: number[]

    setTemps(): void {
        if (this.value > this.max_temp) {
            this.value = this.target;
            this.$toast.error("Temperature too high for "+this.name+"! (max: "+this.max_temp+")")
        } else if (this.value < this.min_temp && this.value != 0) {
            this.value = this.target;
            this.$toast.error("Temperature too low for "+this.name+"! (min: "+this.min_temp+")")
        } else {
            const gcode = this.command+' '+this.attributeName+'='+this.name+' TARGET='+this.value
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        }
    }

    mounted() {
        this.value = this.target
    }

    @Watch('target')
    targetChanged(newVal: number): void{
        window.console.log("targetChanged")
        this.value = newVal
    }

}
</script>