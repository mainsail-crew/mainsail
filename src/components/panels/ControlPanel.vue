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
        <v-row class="" v-if="['standby', 'paused', 'complete', 'error'].includes(printer_state)">
            <v-col class="col-12 pb-0 text-center">
                <v-btn small @click="doHome" :loading="loadings.includes('homeAll')" :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"><v-icon class="mr-1">mdi-home</v-icon><span class="d-none d-sm-inline">Home </span>all</v-btn>
                <v-btn small @click="doQGL" :loading="loadings.includes('qgl')" color="primary" class="ml-2" v-if="'quad_gantry_level' in config">QGL</v-btn>
               <v-btn small @click="doZtilt" :loading="loadings.includes('zTilt')" color="primary" class="ml-2" v-if="'z_tilt' in config">Z Tilt</v-btn>
            </v-col>
        </v-row>
        <v-row class="mt-3" v-if="['standby', 'paused', 'complete', 'error'].includes(printer_state)">
            <v-col class="col-12 py-0 px-6 text-center">
                <v-btn-toggle dense no-gutters class="row mx-auto" style="flex-wrap: nowrap;" >
                    <v-btn @click="doSendMove('X-100')" class="btnMinWidthAuto col"><span class="body-2">-100</span></v-btn>
                    <v-btn @click="doSendMove('X-10')" class="btnMinWidthAuto col"><span class="body-2">-10</span></v-btn>
                    <v-btn @click="doSendMove('X-1')" class="btnMinWidthAuto col"><span class="body-2">-1</span></v-btn>
                    <v-btn @click="doHomeX" :color="homedAxes.includes('x') ? 'primary' : 'warning'" :loading="loadings.includes('homeX')" class="font-weight-bold btnHomeAxis">X</v-btn>
                    <v-btn @click="doSendMove('X+1')" class="btnMinWidthAuto col"><span class="body-2">+1</span></v-btn>
                    <v-btn @click="doSendMove('X+10')" class="btnMinWidthAuto col"><span class="body-2">+10</span></v-btn>
                    <v-btn @click="doSendMove('X+100')" class="btnMinWidthAuto col"><span class="body-2">+100</span></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="mt-3" v-if="['standby', 'paused', 'complete', 'error'].includes(printer_state)">
            <v-col class="col-12 py-0 px-6 text-center">
                <v-btn-toggle dense no-gutters class="row mx-auto" style="flex-wrap: nowrap;" >
                    <v-btn @click="doSendMove('Y-100')" class="btnMinWidthAuto col"><span class="body-2">-100</span></v-btn>
                    <v-btn @click="doSendMove('Y-10')" class="btnMinWidthAuto col"><span class="body-2">-10</span></v-btn>
                    <v-btn @click="doSendMove('Y-1')" class="btnMinWidthAuto col"><span class="body-2">-1</span></v-btn>
                    <v-btn @click="doHomeY" :color="homedAxes.includes('y') ? 'primary' : 'warning'" :loading="loadings.includes('homeY')" class="font-weight-bold btnHomeAxis">Y</v-btn>
                    <v-btn @click="doSendMove('Y+1')" class="btnMinWidthAuto col"><span class="body-2">+1</span></v-btn>
                    <v-btn @click="doSendMove('Y+10')" class="btnMinWidthAuto col"><span class="body-2">+10</span></v-btn>
                    <v-btn @click="doSendMove('Y+100')" class="btnMinWidthAuto col"><span class="body-2">+100</span></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="mt-3" v-if="['standby', 'paused', 'complete', 'error'].includes(printer_state)">
            <v-col class="col-12 py-0 px-6 text-center">
                <v-btn-toggle dense no-gutters class="row mx-auto" style="flex-wrap: nowrap;" >
                    <v-btn @click="doSendMove('Z-25')" dense class="btnMinWidthAuto col"><span class="body-2">-25</span></v-btn>
                    <v-btn @click="doSendMove('Z-1')" dense class="btnMinWidthAuto col"><span class="body-2">-1</span></v-btn>
                    <v-btn @click="doSendMove('Z-0.1')" dense class="btnMinWidthAuto col"><span class="body-2">-0.1</span></v-btn>
                    <v-btn @click="doHomeZ" :color="homedAxes.includes('z') ? 'primary' : 'warning'" :loading="loadings.includes('homeZ')" class="font-weight-bold btnHomeAxis">Z</v-btn>
                    <v-btn @click="doSendMove('Z+0.1')" dense class="btnMinWidthAuto col"><span class="body-2">+0.1</span></v-btn>
                    <v-btn @click="doSendMove('Z+1')" dense class="btnMinWidthAuto col"><span class="body-2">+1</span></v-btn>
                    <v-btn @click="doSendMove('Z+25')" dense class="btnMinWidthAuto col"><span class="body-2">+25</span></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="" v-if="this['printer/getMacros'].length > 0">
            <v-col class="col-12 px-4 py-2 text-center">
                <div v-for="(macro, index) in this['printer/getMacros']" v-bind:key="index+99" class="d-inline-block mx-1 my-1">
                    <v-btn small color="primary" class="mx-1 my-1" :loading="loadings.includes('macro_'+macro.name)" @click="doSendMacro(macro.name)">{{ macro.name.replace(/_/g, " ") }}</v-btn>
                </div>
            </v-col>
        </v-row>
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
                printer_state: state => state.printer.print_stats.state
            }),
            ...mapGetters([
                'printer/getMacros',
            ])
        },
        methods: {
            doHome() {
                this.$store.commit('server/addEvent', "G28");
                this.$store.commit('socket/addLoading', { name: 'homeAll' });
                this.$socket.sendObj('printer.gcode.script', { script: "G28" }, "socket/removeLoading", { name: 'homeAll' });
            },
            doHomeX() {
                this.$store.commit('server/addEvent', "G28 X");
                this.$store.commit('socket/addLoading', { name: 'homeX' });
                this.$socket.sendObj('printer.gcode.script', { script: "G28 X" }, "socket/removeLoading", { name: 'homeX' });
            },
            doHomeY() {
                this.$store.commit('server/addEvent', "G28 Y");
                this.$store.commit('socket/addLoading', { name: 'homeY' });
                this.$socket.sendObj('printer.gcode.script', { script: "G28 Y" }, "socket/removeLoading", { name: 'homeY' });
            },
            doHomeZ() {
                this.$store.commit('server/addEvent', "G28 Z");
                this.$store.commit('socket/addLoading', { name: 'homeZ' });
                this.$socket.sendObj('printer.gcode.script', { script: "G28 Z" }, "socket/removeLoading", { name: 'homeZ' });
            },
            doQGL() {
                this.$store.commit('server/addEvent', "QUAD_GANTRY_LEVEL");
                this.$store.commit('socket/addLoading', { name: 'qgl' });
                this.$socket.sendObj('printer.gcode.script', { script: "QUAD_GANTRY_LEVEL" }, "socket/removeLoading", { name: 'qgl' });
            },
            doZtilt() {
                this.$store.commit('server/addEvent', "Z_TILT_ADJUST");
                this.$store.commit('socket/addLoading', { name: 'zTilt' });
                this.$socket.sendObj('printer.gcode.script', { script: "Z_TILT_ADJUST" }, "socket/removeLoading", { name: 'zTilt' });
            },
            doSendMove(gcode) {
                gcode = "G91" + "\n" +
                    "G1 " + gcode + " F6000" + "\n" +
                    "G90";

                this.doSend(gcode);
            },
            doSend(gcode) {
                this.$store.commit('server/addEvent', gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "server/getGcodeRespond");
            },
            doSendMacro(gcode) {
                this.$store.commit('server/addEvent', gcode);
                this.$store.commit('socket/addLoading', { name: 'macro_'+gcode });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'macro_'+gcode });
            },
        }
    }
</script>