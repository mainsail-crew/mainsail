<style>

</style>

<template>
    <v-card>
        <v-col xs12 md12>
            <v-row class="px-1 mb-2 text-center">
                <div class="d-inline-block mx-2 my-1"><v-btn @click="doHome" :loading="loadingHome" :color="homedAxes.includes('xyz') ? 'primary' : 'warning'" class=""><v-icon class="mr-2">mdi-home</v-icon><span class="d-none d-sm-inline">Home </span>all</v-btn></div>
                <div class="d-inline-block mx-2 my-1"><v-btn v-if="config.hasOwnProperty('quad_gantry_level')" @click="doQGL" :loading="loadingQGL" color="primary">QGL</v-btn></div>
                <div class="d-none d-sm-inline-block mx-2 my-1"><v-btn @click="doRestart" :loading="loadingRestart" color="error"><v-icon class="mr-sm-2">mdi-cached</v-icon>Restart</v-btn></div>
                <div class="d-inline-block mx-2 my-1"><v-btn @click="doRestartFirmware" :loading="loadingRestartFirmware" color="error"><v-icon class="mr-sm-2">mdi-cached</v-icon><span class="d-none d-sm-block">Firmware Restart</span></v-btn></div>
            </v-row>
            <v-row class="pl-3 pr-3 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('X-100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><v-icon left class="d-sm-flex">mdi-chevron-left</v-icon><span>X-100</span></v-btn>
                    <v-btn @click="doSendMove('X-10')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>X-10</span></v-btn>
                    <v-btn @click="doSendMove('X-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>X-1</span></v-btn>
                    <v-btn @click="doHomeX" :color="homedAxes.includes('x') ? 'primary' : 'warning'" :loading="loadingHomeX"><v-icon class="mdi mdi-home"></v-icon></v-btn>
                    <v-btn @click="doSendMove('X+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>X+1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('X+10')" cols="1" class="flex-grow-1 flex-shrink-0"><span>X+10</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('X+100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><span>X+100</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-row>
            <v-row class="pl-3 pr-3 mt-3 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('Y-100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Y-100</span></v-btn>
                    <v-btn @click="doSendMove('Y-10')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Y-10</span></v-btn>
                    <v-btn @click="doSendMove('Y-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Y-1</span></v-btn>
                    <v-btn @click="doHomeY" :color="homedAxes.includes('y') ? 'primary' : 'warning'" :loading="loadingHomeY"><v-icon class="mdi mdi-home"></v-icon></v-btn>
                    <v-btn @click="doSendMove('Y+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Y+1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Y+10')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Y+10</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Y+100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><span>Y+100</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-row>
            <v-row class="pl-3 pr-3 mt-3 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('Z-25')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Z-25</span></v-btn>
                    <v-btn @click="doSendMove('Z-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Z-1</span></v-btn>
                    <v-btn @click="doSendMove('Z-0.1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Z-0.1</span></v-btn>
                    <v-btn @click="doHomeZ" :color="homedAxes.includes('z') ? 'primary' : 'warning'" :loading="loadingHomeZ"><v-icon class="mdi mdi-home"></v-icon></v-btn>
                    <v-btn @click="doSendMove('Z+0.1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Z+0.1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Z+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Z+1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Z+25')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><span>Z+25</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-row>
            <v-row class="px-1 pt-0 pb-0 mt-3" v-if="getMacros.length > 0">
                <v-col class="col-12 text-center">
                    <div v-for="(macro, index) in getMacros" v-bind:key="index+99" class="d-inline-block mx-1 my-1">
                        <v-btn color="primary" class="mx-1" @click="doSend(macro.name)">{{ macro.name }}</v-btn>
                    </div>
                </v-col>
            </v-row>
        </v-col>
    </v-card>
</template>

<script>
    import { mapState, mapGetters, mapMutations } from 'vuex'

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapState({
                loadingHome: state => state.socket.loadingHome,
                loadingHomeX: state => state.socket.loadingHomeX,
                loadingHomeY: state => state.socket.loadingHomeY,
                loadingHomeZ: state => state.socket.loadingHomeZ,
                loadingQGL: state => state.socket.loadingQGL,
                loadingRestart: state => state.socket.loadingRestart,
                loadingRestartFirmware: state => state.socket.loadingRestartFirmware,
                homedAxes: state => state.printer.toolhead.homed_axes,
                config: state => state.config,
            }),
            ...mapMutations([
                'setLoadingHome',
                'setLoadingHomeX',
                'setLoadingHomeY',
                'setLoadingHomeZ',
                'setLoadingQGL',
                'setLoadingRestart',
                'setLoadingRestartFirmware',
            ]),
            ...mapGetters([
                'getMacros',
            ])
        },
        methods: {
            doHome() {
                this.$store.commit('setLoadingHome', true);
                this.$socket.sendObj('post_printer_gcode', { script: "G28" }, "responseHome");
            },
            doHomeX() {
                this.$store.commit('setLoadingHomeX', true);
                this.$socket.sendObj('post_printer_gcode', { script: "G28 X" }, "responseHomeX");
            },
            doHomeY() {
                this.$store.commit('setLoadingHomeY', true);
                this.$socket.sendObj('post_printer_gcode', { script: "G28 Y" }, "responseHomeY");
            },
            doHomeZ() {
                this.$store.commit('setLoadingHomeZ', true);
                this.$socket.sendObj('post_printer_gcode', { script: "G28 Z" }, "responseHomeZ");
            },
            doQGL() {
                this.$store.commit('setLoadingQGL', true);
                this.$socket.sendObj('post_printer_gcode', { script: "quad_gantry_level" }, "responseQGL");
            },
            doSendMove(gcode) {
                gcode = "G91" + "\n" +
                    "G1 " + gcode + " F6000" + "\n" +
                    "G90";

                this.doSend(gcode);
            },
            doSend(gcode) {
                this.$socket.sendObj('post_printer_gcode', { script: gcode }, "sendGcode");
            },
            doRestart() {
                this.$store.commit('setLoadingRestart', true);
                this.$socket.sendObj('post_printer_restart', { }, "responseRestart");
            },
            doRestartFirmware() {
                this.$store.commit('setLoadingRestartFirmware', true);
                this.$socket.sendObj('post_printer_firmware_restart', { }, "responseRestartFirmware");
            },
        }
    }
</script>