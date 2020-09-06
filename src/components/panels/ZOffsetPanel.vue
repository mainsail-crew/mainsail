<style>

</style>

<template>
    <v-card v-if="(['printing', 'paused'].includes(printer_state))">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon class="mdi mdi-arrow-collapse-vertical" left></v-icon>Z Baby Stepping</span>
            </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="py-1">
            <v-row class="">
                <v-col class="col-12 pb-0 text-center">
                    <p>Current Offset: {{ homing_origin.length > 1 ? homing_origin[2].toFixed(2) : 0.00 }}mm</p>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="col-12 pt-0 text-center d-flex flex-column align-center flex-sm-row justify-center">
                    <v-btn-toggle borderless no-gutters class="mx-2 mb-2 order-last flex-nowrap order-sm-first" >
                        <v-btn @click="sendBabySteppingDownFine()" class="" :loading="loadingBabySteppingDownFine" ><v-icon class="mr-2">mdi-arrow-collapse-down</v-icon> -0.01mm</v-btn>
                        <v-btn @click="sendBabySteppingDown()" class="" :loading="loadingBabySteppingDown" >-0.05mm</v-btn>
                    </v-btn-toggle>
                    <v-btn-toggle borderless no-gutters class="mx-2 mb-2 order-first flex-nowrap order-sm-last" >
                        <v-btn @click="sendBabySteppingUpFine()" class="" :loading="loadingBabySteppingUpFine" ><v-icon class="mr-2">mdi-arrow-expand-up</v-icon> +0.01mm</v-btn>
                        <v-btn @click="sendBabySteppingUp()" class="" :loading="loadingBabySteppingUp" >+0.05mm</v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>
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
                loadingBabySteppingDownFine: false,
                loadingBabySteppingDown: false,
                loadingBabySteppingUpFine: false,
                loadingBabySteppingUp: false,
            }
        },
        computed: {
            ...mapState({
                loadings: state => state.loadings,
                homing_origin: state => state.printer.gcode_move.homing_origin,
                printer_state: state => state.printer.print_stats.state,
                homed_axis: state => state.printer.toolhead.homed_axes,
            }),
        },
        methods: {
            sendBabySteppingDownFine() {
                let gcode = "SET_GCODE_OFFSET Z_ADJUST=-0.01"+(this.homed_axis === "xyz" ? " MOVE=1" : "");
                this.$store.commit('setLoading', { name: 'babySteppingDownFine' });
                this.$store.commit('addGcodeResponse', gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "respondeBabySteppingDownFine");
            },
            sendBabySteppingDown() {
                let gcode = "SET_GCODE_OFFSET Z_ADJUST=-0.05"+(this.homed_axis === "xyz" ? " MOVE=1" : "");
                this.$store.commit('setLoading', { name: 'babySteppingDown' });
                this.$store.commit('addGcodeResponse', gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "respondeBabySteppingDown");
            },
            sendBabySteppingUpFine() {
                let gcode = "SET_GCODE_OFFSET Z_ADJUST=0.01"+(this.homed_axis === "xyz" ? " MOVE=1" : "");
                this.$store.commit('setLoading', { name: 'babySteppingUpFine' });
                this.$store.commit('addGcodeResponse', gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "respondeBabySteppingUpFine");
            },
            sendBabySteppingUp() {
                let gcode = "SET_GCODE_OFFSET Z_ADJUST=0.05"+(this.homed_axis === "xyz" ? " MOVE=1" : "");
                this.$store.commit('setLoading', { name: 'babySteppingUp' });
                this.$store.commit('addGcodeResponse', gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "respondeBabySteppingUp");
            },
        },
        watch: {
            loadings: function(loadings) {
                this.loadingBabySteppingDownFine = loadings.includes('babySteppingDownFine');
                this.loadingBabySteppingDown = loadings.includes('babySteppingDown');
                this.loadingBabySteppingUpFine = loadings.includes('babySteppingUpFine');
                this.loadingBabySteppingUp = loadings.includes('babySteppingUp');
            },
        }
    }
</script>