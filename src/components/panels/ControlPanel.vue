<style>
    .btnHomeAxis {
        width: 36px;
        min-width: 36px !important;
    }

    .btnMinWidthAuto {
        min-width: auto !important;
    }
</style>

<template>
    <v-card>
        <v-container class="pt-0">
            <v-row no-gutters class="" v-if="['standby', 'paused', 'complete', 'error'].includes(printer_state)">
                <v-col class="col-12 mt-3 pb-0 text-center">
                    <v-btn small @click="doHome" :loading="loadings.includes('homeAll')" :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"><v-icon class="mr-1">mdi-home</v-icon><span class="d-none d-sm-inline">Home </span>all</v-btn>
                    <v-btn small @click="doQGL" :loading="loadings.includes('qgl')" color="primary" class="ml-2" v-if="'quad_gantry_level' in config">QGL</v-btn>
                    <v-btn small @click="doZtilt" :loading="loadings.includes('zTilt')" color="primary" class="ml-2" v-if="'z_tilt' in config">Z Tilt</v-btn>
                </v-col>
            </v-row>
            <v-row no-gutters class="mt-3" v-if="['standby', 'paused', 'complete', 'error'].includes(printer_state)">
                <v-col class="text-center">
                    <v-btn-toggle dense no-gutters class="row no-gutters  mx-auto" style="flex-wrap: nowrap;" >
                        <v-btn @click="doSendMove('X-100', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">-100</span></v-btn>
                        <v-btn @click="doSendMove('X-10', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">-10</span></v-btn>
                        <v-btn @click="doSendMove('X-1', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">-1</span></v-btn>
                        <v-btn @click="doHomeX" :color="homedAxes.includes('x') ? 'primary' : 'warning'" :loading="loadings.includes('homeX')" class="font-weight-bold btnHomeAxis">X</v-btn>
                        <v-btn @click="doSendMove('X+1', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">+1</span></v-btn>
                        <v-btn @click="doSendMove('X+10', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">+10</span></v-btn>
                        <v-btn @click="doSendMove('X+100', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">+100</span></v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>
            <v-row no-gutters class="mt-3" v-if="['standby', 'paused', 'complete', 'error'].includes(printer_state)">
                <v-col class="text-center">
                    <v-btn-toggle dense no-gutters class="row no-gutters  mx-auto" style="flex-wrap: nowrap;" >
                        <v-btn @click="doSendMove('Y-100', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">-100</span></v-btn>
                        <v-btn @click="doSendMove('Y-10', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">-10</span></v-btn>
                        <v-btn @click="doSendMove('Y-1', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">-1</span></v-btn>
                        <v-btn @click="doHomeY" :color="homedAxes.includes('y') ? 'primary' : 'warning'" :loading="loadings.includes('homeY')" class="font-weight-bold btnHomeAxis">Y</v-btn>
                        <v-btn @click="doSendMove('Y+1', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">+1</span></v-btn>
                        <v-btn @click="doSendMove('Y+10', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">+10</span></v-btn>
                        <v-btn @click="doSendMove('Y+100', feedrateXY)" class="btnMinWidthAuto col"><span class="body-2">+100</span></v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>
            <v-row no-gutters class="mt-3" v-if="['standby', 'paused', 'complete', 'error'].includes(printer_state)">
                <v-col class="text-center">
                    <v-btn-toggle dense no-gutters class="row no-gutters mx-auto" style="flex-wrap: nowrap;" >
                        <v-btn @click="doSendMove('Z-25', feedrateZ)" dense class="btnMinWidthAuto col"><span class="body-2">-25</span></v-btn>
                        <v-btn @click="doSendMove('Z-1', feedrateZ)" dense class="btnMinWidthAuto col"><span class="body-2">-1</span></v-btn>
                        <v-btn @click="doSendMove('Z-0.1', feedrateZ)" dense class="btnMinWidthAuto col"><span class="body-2">-0.1</span></v-btn>
                        <v-btn @click="doHomeZ" :color="homedAxes.includes('z') ? 'primary' : 'warning'" :loading="loadings.includes('homeZ')" class="font-weight-bold btnHomeAxis">Z</v-btn>
                        <v-btn @click="doSendMove('Z+0.1', feedrateZ)" dense class="btnMinWidthAuto col"><span class="body-2">+0.1</span></v-btn>
                        <v-btn @click="doSendMove('Z+1', feedrateZ)" dense class="btnMinWidthAuto col"><span class="body-2">+1</span></v-btn>
                        <v-btn @click="doSendMove('Z+25', feedrateZ)" dense class="btnMinWidthAuto col"><span class="body-2">+25</span></v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>
            <v-row no-gutters v-if="this['printer/getMacros'].length > 0">
                <v-col class="text-center">
                    <v-btn v-for="(macro, index) in this['printer/getMacros']" v-bind:key="index+99" small color="primary" class="mx-1 mt-3" :loading="loadings.includes('macro_'+macro.name)" @click="doSendMacro(macro.name)">{{ macro.name.replace(/_/g, " ") }}</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
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
                homedAxes: state => state.printer.toolhead.homed_axes,
                config: state => state.printer.configfile.config,
                loadings: state => state.socket.loadings,
                printer_state: state => state.printer.print_stats.state,

                feedrateXY: state => state.gui.dashboard.control.feedrateXY,
                feedrateZ: state => state.gui.dashboard.control.feedrateZ,
            }),
            ...mapGetters([
                'printer/getMacros',
            ])
        },
        methods: {
            doHome() {
                this.$store.commit('server/addEvent', { message: "G28", type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'homeAll' });
                this.$socket.sendObj('printer.gcode.script', { script: "G28" }, "socket/removeLoading", { name: 'homeAll' });
            },
            doHomeX() {
                this.$store.commit('server/addEvent', { message: "G28 X", type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'homeX' });
                this.$socket.sendObj('printer.gcode.script', { script: "G28 X" }, "socket/removeLoading", { name: 'homeX' });
            },
            doHomeY() {
                this.$store.commit('server/addEvent', { message: "G28 Y", type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'homeY' });
                this.$socket.sendObj('printer.gcode.script', { script: "G28 Y" }, "socket/removeLoading", { name: 'homeY' });
            },
            doHomeZ() {
                this.$store.commit('server/addEvent', { message: "G28 Z", type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'homeZ' });
                this.$socket.sendObj('printer.gcode.script', { script: "G28 Z" }, "socket/removeLoading", { name: 'homeZ' });
            },
            doQGL() {
                this.$store.commit('server/addEvent', { message: "QUAD_GANTRY_LEVEL", type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'qgl' });
                this.$socket.sendObj('printer.gcode.script', { script: "QUAD_GANTRY_LEVEL" }, "socket/removeLoading", { name: 'qgl' });
            },
            doZtilt() {
                this.$store.commit('server/addEvent', { message: "Z_TILT_ADJUST", type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'zTilt' });
                this.$socket.sendObj('printer.gcode.script', { script: "Z_TILT_ADJUST" }, "socket/removeLoading", { name: 'zTilt' });
            },
            doSendMove(gcode, feedrate) {
                gcode = "G91" + "\n" +
                    "G1 " + gcode + " F"+feedrate*60 + "\n" +
                    "G90";

                this.doSend(gcode);
            },
            doSend(gcode) {
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "server/getGcodeRespond");
            },
            doSendMacro(gcode) {
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'macro_'+gcode });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'macro_'+gcode });
            },
        }
    }
</script>