<style>
    .settingsRunoutSwitchInput .v-messages {
        display: none;
    }
</style>

<template>
    <div>
        <v-row class="px-6" >
            <v-col sm-12>
                <v-switch v-model="value" :label="enabled ? 'enabled' : 'disabled'" @change="changeSensor()" class="settingsRunoutSwitchInput my-0"></v-switch>
            </v-col>
        </v-row>
        <v-row class="px-6" v-if="value" >
            <v-col sm-12>
                <label class="mt-1 d-inline-block">Filament:</label>
                <v-chip class="float-right" :color="filament_detected ? 'green' : 'red' " text-color="white">{{ filament_detected ? 'detected' : 'empty' }}</v-chip>
            </v-col>
        </v-row>
    </div>
</template>


<script>
    export default {
        data: function() {
            return {
                value: false,
            }
        },
        props: {
            name: String,
            enabled: Boolean,
            filament_detected: Boolean,

        },
        computed: {

        },
        methods: {
            changeSensor() {
                let gcode = 'SET_FILAMENT_SENSOR SENSOR='+this.name+' ENABLE='+(this.value ? 1 : 0)
                this.$store.commit('server/addEvent', gcode)
                this.$socket.sendObj('printer.gcode.script', { script: gcode })
            }
        },
        created() {
            this.value = this.enabled
        }
    }
</script>