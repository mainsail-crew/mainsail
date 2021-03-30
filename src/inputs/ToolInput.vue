<style>
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



<script>
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
            }
        },
        watch: {
            target: function() {
                this.value = this.target;
            }
        },
    }
</script>