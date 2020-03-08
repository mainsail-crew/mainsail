<style>

</style>

<template>
    <v-card>
        <v-col xs12 md12>
            <v-row class="pl-3 pr-3 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSend('X-100')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left>mdi-chevron-left</v-icon><span>X-100</span></v-btn>
                    <v-btn @click="doSend('X-10')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left>mdi-chevron-left</v-icon><span>X-10</span></v-btn>
                    <v-btn @click="doSend('X-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left>mdi-chevron-left</v-icon><span>X-1</span></v-btn>
                    <v-btn @click="doHomeX" :color="homedAxes.includes('x') ? 'primary' : 'warning'" :loading="loadingHomeX"><span>Home X</span></v-btn>
                    <v-btn @click="doSend('X+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>X+1</span><v-icon right>mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSend('X+10')" cols="1" class="flex-grow-1 flex-shrink-0"><span>X+10</span><v-icon right>mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSend('X+100')" cols="1" class="flex-grow-1 flex-shrink-0"><span>X+100</span><v-icon right>mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-row>
            <v-row class="pl-3 pr-3 mt-3 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSend('Y-100')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left>mdi-chevron-left</v-icon><span>Y-100</span></v-btn>
                    <v-btn @click="doSend('Y-10')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left>mdi-chevron-left</v-icon><span>Y-10</span></v-btn>
                    <v-btn @click="doSend('Y-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left>mdi-chevron-left</v-icon><span>Y-1</span></v-btn>
                    <v-btn @click="doHomeY" :color="homedAxes.includes('y') ? 'primary' : 'warning'" :loading="loadingHomeY"><span>Home Y</span></v-btn>
                    <v-btn @click="doSend('Y+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Y+1</span><v-icon right>mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSend('Y+10')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Y+10</span><v-icon right>mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSend('Y+100')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Y+100</span><v-icon right>mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-row>
            <v-row class="pl-3 pr-3 mt-3 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSend('Z-25')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left>mdi-chevron-left</v-icon><span>Z-25</span></v-btn>
                    <v-btn @click="doSend('Z-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left>mdi-chevron-left</v-icon><span>Z-1</span></v-btn>
                    <v-btn @click="doSend('Z-0.1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left>mdi-chevron-left</v-icon><span>Z-0.1</span></v-btn>
                    <v-btn @click="doHomeZ" :color="homedAxes.includes('z') ? 'primary' : 'warning'" :loading="loadingHomeZ"><span>Home Z</span></v-btn>
                    <v-btn @click="doSend('Z+0.1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Z+0.1</span><v-icon right>mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSend('Z+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Z+1</span><v-icon right>mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSend('Z+25')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Z+25</span><v-icon right>mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-row>
            <v-row class="px-3 mt-3">
                <v-spacer></v-spacer>
                <v-btn @click="doRestart" :loading="loadingRestart" color="error"><v-icon left>mdi-cached</v-icon>Restart</v-btn>
                <v-btn @click="doRestartFirmware" :loading="loadingRestartFirmware" color="error" class="ml-3"><v-icon left>mdi-cached</v-icon>Firmware Restart</v-btn>
            </v-row>
        </v-col>
    </v-card>
</template>

<script>
    import { mapState, mapMutations } from 'vuex'

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapState({
                loadingHomeX: state => state.socket.loadingHomeX,
                loadingHomeY: state => state.socket.loadingHomeY,
                loadingHomeZ: state => state.socket.loadingHomeZ,
                loadingRestart: state => state.socket.loadingRestart,
                loadingRestartFirmware: state => state.socket.loadingRestartFirmware,
                homedAxes: state => state.printer.toolhead.homed_axes,
            }),
            ...mapMutations([
                'setLoadingHomeX',
                'setLoadingHomeY',
                'setLoadingHomeZ',
                'setLoadingRestart',
                'setLoadingRestartFirmware',
            ])
        },
        methods: {
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
            doSend(gcode) {
                gcode = "G91" + "\n" +
                    "G1 " + gcode + " F6000" + "\n" +
                    "G90";

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