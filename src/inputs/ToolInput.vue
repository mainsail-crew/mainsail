<style>
    .tool-input .v-select__slot label{
        display:none!important;
    }
</style>

<template>
    <v-combobox
        :label="convertName(this.name)"
        dense
        hide-details
        @click.native="showKeyboard"
        @blur="hideKeyboard"
        data-layout="numeric" 
        onClick="this.select();"
        v-model="value"
        class="tool-input"
        :items="items"
        item-text="value"
        @change="setTemps"
    ></v-combobox>
</template>



<script>
    import {convertName} from "@/plugins/helpers"
    import {bus} from "../main";
    import Vue from "vue";

    /*
<v-text-field v-if="false" type="number" min="0" :max="max_temp" step="any" ref="toolField"  class="tool-input">
</v-text-field>
*/

    export default {
        data: function() {
            return {
                value: this.target
            }
        },
        props: {
            name: String,
            target: Number,
            min_temp: Number,
            max_temp: Number,
            command: String,
            attributeName: String,
            items: Array,
        },
        computed: {

        },
        methods: {
            convertName: convertName,
            setTemps() {
                if (typeof this.value === 'object' && this.value !== null) this.value = this.value.value
                if (parseFloat(this.value) === 0) this.value = 0
                
                if (this.max_temp !== undefined && this.value > this.max_temp) {
                    this.value = this.target;
                    Vue.$toast.error("Temperature too high for "+this.name+"! (max: "+this.max_temp+")");
                } else if (this.min_temp !== undefined && this.value < this.min_temp && parseFloat(this.value) !== 0) {
                    this.value = this.target;
                    Vue.$toast.error("Temperature too low for "+this.name+"! (min: "+this.min_temp+")");
                } else {
                    const gcode = this.command+' '+this.attributeName+'='+this.name+' TARGET='+this.value
                    this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                    this.$socket.sendObj('printer.gcode.script', { script: gcode });
                }
            },
            showKeyboard:function(e){
                bus.$emit("showkeyboard",e);
            },
            hideKeyboard:function(){
                bus.$emit("hidekeyboard");
            }
        },
        watch: {
            target: function() {
                this.value = this.target;
            }
        },
    }
</script>