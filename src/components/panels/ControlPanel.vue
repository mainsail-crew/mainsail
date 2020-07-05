<style>

</style>

<template>
    <v-card>
        <v-row class="" v-if="!is_printing">
            <v-col class="col-12 pb-0 text-center">
                <div class="d-inline-block mx-2 my-1"><v-btn @click="doHome" :loading="loadingHomeAll" :color="homedAxes.includes('xyz') ? 'primary' : 'warning'" class=""><v-icon class="mr-1">mdi-home</v-icon><span class="d-none d-sm-inline">Home </span>all</v-btn></div>
                <div class="d-inline-block mx-2 my-1" v-if="config.hasOwnProperty('quad_gantry_level')"><v-btn @click="doQGL" :loading="loadingQGL" color="primary">QGL</v-btn></div>
            </v-col>
        </v-row>
        <v-row class="mt-3" v-if="!is_printing">
            <v-col class="col-12 py-0 px-6 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('X-100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><v-icon left class="d-sm-flex">mdi-chevron-left</v-icon><span class="body-2">X-100</span></v-btn>
                    <v-btn @click="doSendMove('X-10')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span class="body-2">X-10</span></v-btn>
                    <v-btn @click="doSendMove('X-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span class="body-2">X-1</span></v-btn>
                    <v-btn @click="doHomeX" :color="homedAxes.includes('x') ? 'primary' : 'warning'" :loading="loadingHomeX"><v-icon class="mdi mdi-home"></v-icon></v-btn>
                    <v-btn @click="doSendMove('X+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span class="body-2">X+1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('X+10')" cols="1" class="flex-grow-1 flex-shrink-0"><span class="body-2">X+10</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('X+100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><span class="body-2">X+100</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="mt-3" v-if="!is_printing">
            <v-col class="col-12 py-0 px-6 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('Y-100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span class="body-2">Y-100</span></v-btn>
                    <v-btn @click="doSendMove('Y-10')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span class="body-2">Y-10</span></v-btn>
                    <v-btn @click="doSendMove('Y-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span class="body-2">Y-1</span></v-btn>
                    <v-btn @click="doHomeY" :color="homedAxes.includes('y') ? 'primary' : 'warning'" :loading="loadingHomeY"><v-icon class="mdi mdi-home"></v-icon></v-btn>
                    <v-btn @click="doSendMove('Y+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span class="body-2">Y+1</span><v-icon right class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Y+10')" cols="1" class="flex-grow-1 flex-shrink-0"><span class="body-2">Y+10</span><v-icon right class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Y+100')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><span class="body-2">Y+100</span><v-icon right class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="mt-3" v-if="!is_printing">
            <v-col class="col-12 py-0 px-6 text-center">
                <v-btn-toggle borderless no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('Z-25')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left  class="d-none d-sm-flex">mdi-chevron-left</v-icon><span class="body-2">Z-25</span></v-btn>
                    <v-btn @click="doSendMove('Z-1')" cols="1" class="flex-grow-1 flex-shrink-0"><v-icon left class="d-none d-sm-flex">mdi-chevron-left</v-icon><span class="body-2">Z-1</span></v-btn>
                    <v-btn @click="doSendMove('Z-0.1')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><v-icon left class="d-none d-sm-flex">mdi-chevron-left</v-icon><span class="body-2">Z-0.1</span></v-btn>
                    <v-btn @click="doHomeZ" :color="homedAxes.includes('z') ? 'primary' : 'warning'" :loading="loadingHomeZ"><v-icon class="mdi mdi-home"></v-icon></v-btn>
                    <v-btn @click="doSendMove('Z+0.1')" cols="1" class="flex-grow-1 flex-shrink-0 d-none d-sm-flex"><span class="body-2">Z+0.1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Z+1')" cols="1" class="flex-grow-1 flex-shrink-0"><span class="body-2">Z+1</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                    <v-btn @click="doSendMove('Z+25')" cols="1" class="flex-grow-1 flex-shrink-0"><span class="body-2">Z+25</span><v-icon right  class="d-none d-sm-flex">mdi-chevron-right</v-icon></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="" v-if="getMacros.length > 0">
            <v-col class="col-12 px-2 py-2 text-center">
                <div v-for="(macro, index) in getMacros" v-bind:key="index+99" class="d-inline-block mx-1 my-1">
                    <v-btn color="primary" class="mx-1 my-1" @click="doSend(macro.name)">{{ macro.name }}</v-btn>
                </div>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
    import { mapState, mapGetters, mapMutations } from 'vuex'
    import Vue from "vue";

    export default {
        components: {

        },
        data: function() {
            return {
                loadingHomeAll: false,
                loadingHomeX: false,
                loadingHomeY: false,
                loadingHomeZ: false,
            }
        },
        computed: {
            ...mapState({
                loadingQGL: state => state.socket.loadingQGL,
                homedAxes: state => state.printer.toolhead.homed_axes,
                config: state => state.config,
                loadings: state => state.loadings,
            }),
            ...mapMutations([
                'setLoadingQGL',
            ]),
            ...mapGetters([
                'getMacros',
                'is_printing'
            ])
        },
        methods: {
            doHome() {
                this.$store.commit('addGcodeResponse', "G28");
                this.$store.commit('setLoading', { name: 'controlHomeAll' });
                this.$socket.sendObj('post_printer_gcode_script', { script: "G28" }, "responseHome");
            },
            doHomeX() {
                this.$store.commit('addGcodeResponse', "G28 X");
                this.$store.commit('setLoading', { name: 'controlHomeX' });
                this.$socket.sendObj('post_printer_gcode_script', { script: "G28 X" }, "responseHomeX");
            },
            doHomeY() {
                this.$store.commit('addGcodeResponse', "G28 Y");
                this.$store.commit('setLoading', { name: 'controlHomeY' });
                this.$socket.sendObj('post_printer_gcode_script', { script: "G28 Y" }, "responseHomeY");
            },
            doHomeZ() {
                this.$store.commit('addGcodeResponse', "G28 Z");
                this.$store.commit('setLoading', { name: 'controlHomeZ' });
                this.$socket.sendObj('post_printer_gcode_script', { script: "G28 Z" }, "responseHomeZ");
            },
            doQGL() {
                this.$store.commit('addGcodeResponse', "QUAD_GANTRY_LEVEL");
                this.$store.commit('setLoadingQGL', true);
                this.$socket.sendObj('post_printer_gcode_script', { script: "QUAD_GANTRY_LEVEL" }, "responseQGL");
            },
            doSendMove(gcode) {
                gcode = "G91" + "\n" +
                    "G1 " + gcode + " F6000" + "\n" +
                    "G90";

                this.doSend(gcode);
            },
            doSend(gcode) {
                this.$store.commit('addGcodeResponse', gcode);
                Vue.prototype.$socket.sendObj('post_printer_gcode_script', { script: gcode }, "sendGcode");
            },
        },
        watch: {
            loadings: function(loadings) {
                this.loadingHomeAll = loadings.includes('controlHomeAll');
                this.loadingHomeX = loadings.includes('controlHomeX');
                this.loadingHomeY = loadings.includes('controlHomeY');
                this.loadingHomeZ = loadings.includes('controlHomeZ');
            }
        }
    }
</script>