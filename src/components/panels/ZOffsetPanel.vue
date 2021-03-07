<style>

</style>

<template>
    <v-card v-if="(['printing', 'paused'].includes(printer_state))">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon class="mdi mdi-arrow-collapse-vertical" left></v-icon>Z Baby Stepping</span>
            </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="px-0 py-0">
            <v-container>
                <v-row class="py-0">
                    <v-col class="pb-0 text-center">
                        <p class="mb-0">Current Offset: {{ homing_origin.length > 1 ? homing_origin[2].toFixed(2) : 0.00 }}mm</p>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="col text-center d-flex flex-column align-center flex-sm-row justify-center">
                        <v-btn-toggle dense no-gutters class="mx-2 mt-3 mt-sm-0 order-last flex-nowrap order-sm-first" >
                            <v-btn small @click="sendBabySteppingDownFine()" class="" :loading="loadings.includes('babySteppingDownFine')" ><v-icon small class="mr-2">mdi-arrow-collapse-down</v-icon> -0.01mm</v-btn>
                            <v-btn small @click="sendBabySteppingDown()" class="" :loading="loadings.includes('babySteppingDown')" >-0.05mm</v-btn>
                        </v-btn-toggle>
                        <v-btn-toggle dense no-gutters class="mx-2 order-first flex-nowrap order-sm-last" >
                            <v-btn small @click="sendBabySteppingUpFine()" class="" :loading="loadings.includes('babySteppingUpFine')" ><v-icon small class="mr-2">mdi-arrow-expand-up</v-icon> +0.01mm</v-btn>
                            <v-btn small @click="sendBabySteppingUp()" class="" :loading="loadings.includes('babySteppingUp')" >+0.05mm</v-btn>
                        </v-btn-toggle>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'
    import Vue from "vue";

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapState({
                loadings: state => state.socket.loadings,
                homing_origin: state => state.printer.gcode_move.homing_origin,
                printer_state: state => state.printer.print_stats.state,
                homed_axis: state => state.printer.toolhead.homed_axes,
            }),
        },
        methods: {
            sendBabySteppingDownFine() {
                let gcode = "SET_GCODE_OFFSET Z_ADJUST=-0.01"+(this.homed_axis === "xyz" ? " MOVE=1" : "");
                this.$store.commit('socket/addLoading', { name: 'babySteppingDownFine' });
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'babySteppingDownFine' });
            },
            sendBabySteppingDown() {
                let gcode = "SET_GCODE_OFFSET Z_ADJUST=-0.05"+(this.homed_axis === "xyz" ? " MOVE=1" : "");
                this.$store.commit('socket/addLoading', { name: 'babySteppingDown' });
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'babySteppingDown' });
            },
            sendBabySteppingUpFine() {
                let gcode = "SET_GCODE_OFFSET Z_ADJUST=0.01"+(this.homed_axis === "xyz" ? " MOVE=1" : "");
                this.$store.commit('socket/addLoading', { name: 'babySteppingUpFine' });
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'babySteppingUpFine' });
            },
            sendBabySteppingUp() {
                let gcode = "SET_GCODE_OFFSET Z_ADJUST=0.05"+(this.homed_axis === "xyz" ? " MOVE=1" : "");
                this.$store.commit('socket/addLoading', { name: 'babySteppingUp' });
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'babySteppingUp' });
            },
        }
    }
</script>