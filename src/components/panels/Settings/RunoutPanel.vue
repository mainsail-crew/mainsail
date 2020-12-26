<template>
    <div>
        <div v-for="(runout, index) of this['printer/getFilamentSwitchSensors']" v-bind:key="index">
            <v-card class="mt-6">
                <v-toolbar flat dense >
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-printer-3d-nozzle-alert</v-icon>{{ runout.name }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-switch v-model="runout.enabled" hide-details @change="changeSensor(runout)" class="settingsRunoutSwitchInput my-0"></v-switch>
                </v-toolbar>
                <v-card-text v-if="runout.enabled">
                    <v-chip label block :color="runout.filament_detected ? 'green' : 'red' " class="d-block text-center">{{ runout.filament_detected ? 'detected' : 'empty' }}</v-chip>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapGetters([
                'printer/getFilamentSwitchSensors'
            ])
        },
        methods: {
            changeSensor(runout) {
                const gcode = 'SET_FILAMENT_SENSOR SENSOR='+runout.name+' ENABLE='+(runout.enabled ? 1 : 0)
                this.$store.commit('server/addEvent', gcode)
                this.$socket.sendObj('printer.gcode.script', { script: gcode })
            }
        }
    }
</script>