<style>
    .tool-input {
        min-width: 5rem;
        margin-top: 0;
        padding: 0;
    }

    .tool-input .v-input__slot { margin-bottom: 0; }
    .tool-input .v-text-field__details { display: none; }
</style>

<template>
    <v-text-field type="number" min="-273" max="1999" step="any" ref="toolField" v-model="value" class="tool-input" @change="setTemps">
    </v-text-field>
</template>


<script>
    export default {
        data: function() {
            return {
                value: this.target
            }
        },
        props: {
            name: String,
            target: Number,
        },
        computed: {

        },
        methods: {
            setTemps() {
                this.$socket.sendObj('post_printer_gcode', {script: 'SET_HEATER_TEMPERATURE HEATER='+this.name+' TARGET='+this.value});
            }
        },
        watch: {
            target: function() {
                this.value = this.target;
            }
        },
    }
</script>