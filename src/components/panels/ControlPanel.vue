<style lang="scss">
.btnHomeAxis {
    width: 36px;
    min-width: 36px !important;
}

.btnMinWidthAuto {
    min-width: auto !important;
}

.steps {
    width: 100%;
    > div {
        width: 100%;
        display: flex;
        > button {
            flex-grow: 1;
        }
    }
}
</style>

<template>
    <div>
        <v-card class="d-flex mb-4">
            <v-container class="pt-0" style="max-width: 350px;">
                <template v-if="['standby', 'paused', 'complete', 'error'].includes(printer_state)">
                    <template v-if="useCross">
                        <v-row no-gutters>
                            <v-col cols="9" class="mt-3 pb-0 text-center">
                                <v-btn small @click="doQGL" :loading="loadings.includes('qgl')" color="primary" class="ml-2" v-if="'quad_gantry_level' in config">QGL</v-btn>
                                <v-btn small @click="doZtilt" :loading="loadings.includes('zTilt')" color="primary" class="ml-2" v-if="'z_tilt' in config">Z Tilt</v-btn>
                            </v-col>
                            <v-col cols="3" class="mt-3 pb-0 text-right">
                                <v-btn @click="doHome"
                                       :loading="loadings.includes('homeAll')" :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                                       small
                                       width="75"
                                >
                                    <v-icon>mdi-home</v-icon>
                                    <span class="ml-2">ALL</span>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col cols="2" class="mt-3 pb-0 text-center">
        <!--                        <v-btn small :width="crossWidth" :height="crossHeight">
                                    <v-icon>mdi-arrow-top-left-thick</v-icon>
                                </v-btn>-->
                            </v-col>
                            <v-col cols="2" class="mt-3 pb-0 text-center">
                                <v-btn small
                                       class="btnMinWidthAuto"
                                       :width="crossWidth"
                                       :height="crossHeight"
                                       :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                       @click="doSendMove('Y-'+stepsReversed[selectedCrossStep], feedrateXY)">
                                    <v-icon>mdi-arrow-up-thick</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col cols="2" class="mt-3 pb-0">
        <!--                        <v-btn small class="mr-4" :width="crossWidth" :height="crossHeight">
                                    <v-icon>mdi-arrow-top-right-thick</v-icon>
                                </v-btn>-->
                            </v-col>
                            <v-col cols="3" class="mt-3 pb-0 text-center">
                                <v-btn small
                                       class="btnMinWidthAuto"
                                       :width="crossWidth"
                                       :height="crossHeight"
                                       :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                       @click="doSendMove('Z'+(reverseZ ? '-' : '+')+stepsReversed[selectedCrossStep], feedrateZ)">
                                    <v-icon>mdi-arrow-up-thick</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col cols="3" class="mt-3 pb-0 d-flex justify-end align-center">
                                <v-btn width="75"
                                       :loading="loadings.includes('homeX')"
                                       :color="homedAxes.includes('x') ? 'primary' : 'warning'"
                                       @click="doHomeX"
                                       small
                                >
                                    <v-icon>mdi-home</v-icon>
                                    <v-spacer></v-spacer>
                                    <span class="ml-2">X</span>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col cols="2" class="mt-3 pb-0 text-center">
                                <v-btn small
                                       class="btnMinWidthAuto"
                                       :width="crossWidth"
                                       :height="crossHeight"
                                       :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                       @click="doSendMove('X-'+stepsReversed[selectedCrossStep], feedrateXY)">
                                    <v-icon>mdi-arrow-left-thick</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col cols="2" class="mt-3 pb-0 text-center">
    <!--                            <v-btn small :width="crossWidth" :height="crossHeight" :loading="loadings.includes('xy')"  :color="homedAxes.includes('xy') ? 'primary' : 'warning'" @click="doHome">
                                    <v-icon>mdi-home</v-icon>
                                </v-btn>-->
                                <div class="d-flex justify-center align-center fill-height">
                                    X/Y
                                </div>
                            </v-col>
                            <v-col cols="2" class="mt-3 pb-0 text-center">
                                <v-btn small
                                       class="btnMinWidthAuto"
                                       :width="crossWidth"
                                       :height="crossHeight"
                                       :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                       @click="doSendMove('X+'+stepsReversed[selectedCrossStep], feedrateXY)">
                                    <v-icon>mdi-arrow-right-thick</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col cols="3" class="mt-3 pb-0 text-center">
    <!--                            <v-btn small :width="crossWidth" :height="crossHeight">
                                    <v-icon>mdi-home</v-icon>
                                </v-btn>-->
                                <div class="fill-height d-flex justify-center align-center">
                                    Z
                                </div>
                            </v-col>
                            <v-col cols="3" class="mt-3 pb-0 d-flex justify-end align-center">
                                <v-btn width="75"
                                       :loading="loadings.includes('homeY')"
                                       :color="homedAxes.includes('y') ? 'primary' : 'warning'"
                                       @click="doHomeY"
                                       small
                                >
                                    <v-icon>mdi-home</v-icon>
                                    <v-spacer></v-spacer>
                                    <span class="ml-2">Y</span>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col cols="2" class="mt-3 pb-0 text-center">
        <!--                        <v-btn small :width="crossWidth" :height="crossHeight">
                                    <v-icon>mdi-arrow-bottom-left-thick</v-icon>
                                </v-btn>-->
                            </v-col>
                            <v-col cols="2" class="mt-3 pb-0 text-center">
                                <v-btn small
                                       class="btnMinWidthAuto"
                                       :width="crossWidth"
                                       :height="crossHeight"
                                       :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                       @click="doSendMove('Y+'+stepsReversed[selectedCrossStep], feedrateXY)">
                                    <v-icon>mdi-arrow-down-thick</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col cols="2" class="mt-3 pb-0 text-center">
        <!--                        <v-btn small :width="crossWidth" :height="crossHeight">
                                    <v-icon>mdi-arrow-bottom-right-thick</v-icon>
                                </v-btn>-->
                            </v-col>
                            <v-col cols="3" class="mt-3 pb-0 text-center">
                                <v-btn small
                                       class="btnMinWidthAuto"
                                       :width="crossWidth"
                                       :height="crossHeight"
                                       :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                       @click="doSendMove('Z'+(reverseZ ? '+' : '-')+stepsReversed[selectedCrossStep], feedrateZ)">
                                    <v-icon>mdi-arrow-down-thick</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col cols="3" class="mt-3 pb-0 d-flex justify-end align-center">
                                <v-btn width="75"
                                       :loading="loadings.includes('homeZ')"
                                       :color="homedAxes.includes('z') ? 'primary' : 'warning'"
                                       @click="doHomeZ"
                                       small
                                >
                                    <v-icon>mdi-home</v-icon>
                                    <v-spacer></v-spacer>
                                    <span class="ml-2">Z</span>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col class="col-12 mt-3">
                                <v-btn-toggle v-if="stepsReversed.length > 0" dense no-gutters style="flex-wrap: nowrap; width: 100%;" v-model="selectedCrossStep">
                                    <v-btn dense class="btnMinWidthAuto flex-grow-1 px-0" v-for="steps of stepsReversed" :key="'x-'+steps">
                                        <span class="body-2">{{ steps }}</span>
                                    </v-btn>
                                </v-btn-toggle>
                                <div class="font-weight-bold warning rounded pa-2" v-else>
                                    Please configure steps<br>
                                    <router-link style="color: white;" to="/settings/interface">Settings > Interface > Control</router-link>
                                </div>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-else>
                        <v-row no-gutters>
                            <v-col class="col-12 mt-3 pb-0 text-center">
                                <v-btn small @click="doHome" :loading="loadings.includes('homeAll')" :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"><v-icon class="mr-1">mdi-home</v-icon><span class="d-none d-sm-inline">Home </span>all</v-btn>
                                <v-btn small @click="doQGL" :loading="loadings.includes('qgl')" color="primary" class="ml-2" v-if="'quad_gantry_level' in config">QGL</v-btn>
                                <v-btn small @click="doZtilt" :loading="loadings.includes('zTilt')" color="primary" class="ml-2" v-if="'z_tilt' in config">Z Tilt</v-btn>
                            </v-col>
                        </v-row>
                        <v-row no-gutters class="mt-2">
                            <v-col class="text-center">
                                <v-btn-toggle dense no-gutters class="row no-gutters  mx-auto" style="flex-wrap: nowrap;" >
                                    <v-btn @click="doSendMove('X-'+steps, feedrateXY)" class="btnMinWidthAuto col" v-for="steps of stepsXYsorted" v-bind:key="'x-'+steps"><span class="body-2">-{{ steps }}</span></v-btn>
                                    <v-btn @click="doHomeX" :color="homedAxes.includes('x') ? 'primary' : 'warning'" :loading="loadings.includes('homeX')" class="font-weight-bold btnHomeAxis">X</v-btn>
                                    <v-btn @click="doSendMove('X+'+steps, feedrateXY)" class="btnMinWidthAuto col" v-for="steps of stepsXYsortedReverse" v-bind:key="'x+'+steps"><span class="body-2">+{{ steps }}</span></v-btn>
                                </v-btn-toggle>
                            </v-col>
                        </v-row>
                        <v-row no-gutters class="mt-3">
                            <v-col class="text-center">
                                <v-btn-toggle dense no-gutters class="row no-gutters  mx-auto" style="flex-wrap: nowrap;" >
                                    <v-btn @click="doSendMove('Y-'+steps, feedrateXY)" class="btnMinWidthAuto col" v-for="steps of stepsXYsorted" v-bind:key="'y-'+steps"><span class="body-2">-{{ steps }}</span></v-btn>
                                    <v-btn @click="doHomeY" :color="homedAxes.includes('y') ? 'primary' : 'warning'" :loading="loadings.includes('homeY')" class="font-weight-bold btnHomeAxis">Y</v-btn>
                                    <v-btn @click="doSendMove('Y+'+steps, feedrateXY)" class="btnMinWidthAuto col" v-for="steps of stepsXYsortedReverse" v-bind:key="'y+'+steps"><span class="body-2">+{{ steps }}</span></v-btn>
                                </v-btn-toggle>
                            </v-col>
                        </v-row>
                        <v-row no-gutters class="mt-3">
                            <v-col class="text-center">
                                <v-btn-toggle dense no-gutters class="row no-gutters mx-auto" style="flex-wrap: nowrap;" >
                                    <v-btn @click="doSendMove('Z-'+steps, feedrateZ)" class="btnMinWidthAuto col" v-for="steps of stepsZsorted" v-bind:key="'z-'+steps"><span class="body-2">-{{ steps }}</span></v-btn>
                                    <v-btn @click="doHomeZ" :color="homedAxes.includes('z') ? 'primary' : 'warning'" :loading="loadings.includes('homeZ')" class="font-weight-bold btnHomeAxis">Z</v-btn>
                                    <v-btn @click="doSendMove('Z+'+steps, feedrateZ)" class="btnMinWidthAuto col" v-for="steps of stepsZsortedReverse" v-bind:key="'z+'+steps"><span class="body-2">+{{ steps }}</span></v-btn>
                                </v-btn-toggle>
                            </v-col>
                        </v-row>
                    </template>
                </template>
            </v-container>
        </v-card>
        <v-card class="d-flex align-center pa-2">
            <v-row no-gutters v-if="this['printer/getMacros'].length > 0">
                <v-col class="text-center mr-fix-2 mb-fix-2">
                    <v-btn v-for="(macro, index) in this['printer/getMacros']"
                           :key="index+99"
                           small
                           color="primary"
                           class="mr-2 mb-2"
                           :loading="loadings.includes('macro_'+macro.name)"
                           @click="doSendMacro(macro.name)">{{ macro.name.replace(/_/g, " ") }}</v-btn>
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import Vue from "vue";

    export default {
        components: {

        },
        data() {
            return {
                crossWidth: 40,
                crossHeight: 40
            }
        },
        computed: {
            ...mapState({
                homedAxes: state => state.printer.toolhead.homed_axes,
                config: state => state.printer.configfile.config,
                loadings: state => state.socket.loadings,
                printer_state: state => state.printer.print_stats.state,

                feedrateXY: state => state.gui.dashboard.control.feedrateXY,
                stepsXY: state => state.gui.dashboard.control.stepsXY,
                feedrateZ: state => state.gui.dashboard.control.feedrateZ,
                stepsZ: state => state.gui.dashboard.control.stepsZ,
                stepsAll: state => state.gui.dashboard.control.stepsAll,
                useCross: state => state.gui.dashboard.control.useCross,
                reverseZ: state => state.gui.dashboard.control.reverseZ,
            }),
            ...mapGetters([
                'printer/getMacros',
            ]),
            selectedCrossStep: {
                get() {
                    return this.$store.state.gui.dashboard.control.selectedCrossStep;
                },
                set(selectedCrossStep) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { selectedCrossStep } } })
                }
            },
            stepsXYsorted: {
                get() {
                    return [...this.$store.state.gui.dashboard.control.stepsXY].sort(function(a, b) { return b-a })
                }
            },
            stepsXYsortedReverse: {
                get() {
                    return [...this.$store.state.gui.dashboard.control.stepsXY].sort(function(a, b) { return a-b })
                }
            },
            stepsZsorted: {
                get() {
                    return [...this.$store.state.gui.dashboard.control.stepsZ].sort(function(a, b) { return b-a })
                }
            },
            stepsZsortedReverse: {
                get() {
                    return [...this.$store.state.gui.dashboard.control.stepsZ].sort(function(a, b) { return a-b })
                }
            },
            steps: {
                get() {
                    return Array.from(new Set([
                        ...(this.stepsAll ?? [])
                    ])).entries().sort((a, b) => b-a)
                }
            },
            stepsReversed: {
                get() {
                    return Array.from(new Set([
                        ...(this.stepsAll ?? []),
                    ])).sort((a, b) => a-b)
                }
            }
        },
        mounted() {
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
        },
    }
</script>
