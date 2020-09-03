<style>
    .settingsRunoutSwitchInput .v-messages {
        display: none;
    }
</style>

<template>
    <div>
        <v-row class="px-6" >
            <v-col sm-12>
                <v-switch v-model="enabled" :label="enabled ? 'enabled' : 'disabled'" @change="changeSensor()" class="settingsRunoutSwitchInput my-0"></v-switch>
            </v-col>
        </v-row>
        <v-row class="px-6" v-if="enabled" >
            <v-col sm-12>
                <label class="mt-1 d-inline-block">Filament:</label>
                <v-chip class="float-right" :color="filament_detected ? 'green' : 'red' " text-color="white">{{ filament_detected ? 'detected' : 'empty' }}</v-chip>
            </v-col>
        </v-row>
    </div>
</template>


<script>
    import { mapGetters } from 'vuex';

    export default {
        data: function() {
            return {
                value: false,
                enabled: false,
                filament_detected: false,
            }
        },
        props: {
            name: String,
        },
        computed: {
            ...mapGetters([
                'getFilamentSwitchSensors'
            ])
        },
        methods: {
            changeSensor() {
                let gcode = 'SET_FILAMENT_SENSOR SENSOR='+this.name+' ENABLE='+(this.enabled ? 1 : 0);
                this.$socket.sendObj('printer.gcode.script', { script: gcode });
            }
        },
        watch: {
            getFilamentSwitchSensors: function() {
                let sensor = this.getFilamentSwitchSensors.find(sensor => sensor.name === this.name);

                if (sensor) {
                    this.enabled = sensor.enabled;
                    this.filament_detected = sensor.filament_detected;
                }
            }
        },
        created() {
            let sensor = this.getFilamentSwitchSensors.find(sensor => sensor.name === this.name);

            if (sensor) {
                this.enabled = sensor.enabled;
                this.filament_detected = sensor.filament_detected;
            }
        }
    }
</script>