<style>

</style>

<template>
    <v-card>
        <v-row class="">
            <v-col class="col-12 pb-0 text-center">
                <div class="d-inline-block mx-2 my-1"><v-btn @click="doHome" :loading="loadingHome" :color="homedAxes.includes('xyz') ? 'primary' : 'warning'" class=""><v-icon class="mr-1">mdi-home</v-icon><span class="d-none d-sm-inline">Home </span>all</v-btn></div>
                <div class="d-inline-block mx-2 my-1" v-if="config.hasOwnProperty('quad_gantry_level')"><v-btn @click="doQGL" :loading="loadingQGL" color="primary">QGL</v-btn></div>
            </v-col>
        </v-row>
        <v-row class="mt-3">
            <v-col class="col-12 py-0 px-6 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('X-100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><v-icon left class="d-sm-flex">mdi-chevron-left</v-icon><span>X-100</span></v-btn>
                    <v-btn @click="doSendMove('X-10')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>X-10</span></v-btn>
                    <v-btn @click="doSendMove('X-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>X-1</span></v-btn>
                    <v-btn @click="doHomeX" :color="homedAxes.includes('x') ? 'primary' : 'warning'" :loading="loadingHomeX"><v-icon class="mdi mdi-home"></v-icon></v-btn>
                    <v-btn @click="doSendMove('X+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>X+1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('X+10')" cols="1" class="flex-grow-1 flex-shrink-0"><span>X+10</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('X+100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><span>X+100</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="mt-3">
            <v-col class="col-12 py-0 px-6 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('Y-100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Y-100</span></v-btn>
                    <v-btn @click="doSendMove('Y-10')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Y-10</span></v-btn>
                    <v-btn @click="doSendMove('Y-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Y-1</span></v-btn>
                    <v-btn @click="doHomeY" :color="homedAxes.includes('y') ? 'primary' : 'warning'" :loading="loadingHomeY"><v-icon class="mdi mdi-home"></v-icon></v-btn>
                    <v-btn @click="doSendMove('Y+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Y+1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Y+10')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Y+10</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Y+100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><span>Y+100</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="mt-3">
            <v-col class="col-12 py-0 px-6 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('Z-25')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Z-25</span></v-btn>
                    <v-btn @click="doSendMove('Z-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Z-1</span></v-btn>
                    <v-btn @click="doSendMove('Z-0.1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span>Z-0.1</span></v-btn>
                    <v-btn @click="doHomeZ" :color="homedAxes.includes('z') ? 'primary' : 'warning'" :loading="loadingHomeZ"><v-icon class="mdi mdi-home"></v-icon></v-btn>
                    <v-btn @click="doSendMove('Z+0.1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Z+0.1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Z+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span>Z+1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Z+25')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><span>Z+25</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="" v-if="getMacros.length > 0">
            <v-col class="col-12 px-0 py-2 text-center">
                <div v-for="(macro, index) in getMacros" v-bind:key="index+99" class="d-inline-block mx-1 my-1">
                    <v-btn color="primary" class="mx-1 my-1" @click="doSend(macro.name)">{{ macro.name }}</v-btn>
                </div>
            </v-col>
        </v-row>
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
                homedAxes: state => state.printer.toolhead.homed_axes,
                config: state => state.config,
            }),
            ...mapMutations([
                'setLoadingHome',
                'setLoadingHomeX',
                'setLoadingHomeY',
                'setLoadingHomeZ',
                'setLoadingQGL',
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
        }
    }
</script>