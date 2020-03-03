<style scoped>
    .tool-input {
        min-width: 5rem;
    }
</style>

<template>
    <v-text-field type="number" min="-273" max="1999" step="any" v-model="value" class="tool-input" @change="setTemps">
    </v-text-field>
</template>


<script>
    export default {
        data: () => ({
            value: 0
        }),
        props: {
            name: String,
        },
        methods: {
            setTemps() {
                this.$socket.sendObj('post_printer_gcode', {script: 'SET_HEATER_TEMPERATURE HEATER='+this.name+' TARGET='+this.value});
            }
        }
    }
</script>