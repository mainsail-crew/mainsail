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
        <v-card class="mb-4" v-if="['standby', 'paused', 'complete', 'error'].includes(printer_state)">
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-gamepad</v-icon>Controls</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-menu :offset-y="true" :close-on-content-click="false" title="Setup Controls" left>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn small class="px-2 minwidth-0" color="grey darken-3" v-bind="attrs" v-on="on"><v-icon small>mdi-cog</v-icon></v-btn>
                    </template>
                    <v-list>
                        <v-list-item class="minHeight36">
                          <v-checkbox v-model="useCross" class="mt-0" hide-details label="Alternate controls"></v-checkbox>
                        </v-list-item>
                        <template v-if="useCross">
                            <v-list-item class="minHeight36">
                              <v-checkbox v-model="reverseX" class="mt-0" hide-details label="Invert X"></v-checkbox>
                            </v-list-item>
                            <v-list-item class="minHeight36">
                              <v-checkbox v-model="reverseY" class="mt-0" hide-details label="Invert Y"></v-checkbox>
                            </v-list-item>
                            <v-list-item class="minHeight36">
                              <v-checkbox v-model="reverseZ" class="mt-0" hide-details label="Invert Z"></v-checkbox>
                            </v-list-item>
                        </template>
                    </v-list>
                </v-menu>
            </v-toolbar>
            <v-container>
                <template v-if="useCross">
                    <v-row>
                        <v-col :cols="homeCols">
                            <v-row dense class="mb-1">
                                <v-col cols="3"></v-col>
                                <v-col cols="3">
                                    <v-btn class="btnMinWidthAuto fill-width"
                                           :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                           @click="doSendMove('Y'+(reverseY ? '-' : '+')+stepsReversed[selectedCrossStep], feedrateXY)"
                                    >
                                        <v-icon>mdi-chevron-up</v-icon>
                                    </v-btn>
                                </v-col>
                                <v-col cols="3"></v-col>
                                <v-col cols="3">
                                    <v-btn class="btnMinWidthAuto fill-width"
                                           :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                           @click="doSendMove('Z'+(reverseZ ? '-' : '+')+stepsReversed[selectedCrossStep], feedrateZ)"
                                    >
                                        <v-icon>mdi-chevron-up</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="3" class="p-rel">
                                    <v-btn class="btnMinWidthAuto fill-width p-abs" style="top: -50%; width: calc(100% - 8px);"
                                           :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                           @click="doSendMove('X'+(!reverseX ? '-' : '+')+stepsReversed[selectedCrossStep], feedrateXY)"
                                    >
                                        <v-icon>mdi-chevron-left</v-icon>
                                    </v-btn>
                                </v-col>
                                <v-col cols="3">
                                    <v-btn class="btnMinWidthAuto fill-width"
                                           :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                           @click="doSendMove('Y'+(!reverseY ? '-' : '+')+stepsReversed[selectedCrossStep], feedrateXY)"
                                    >
                                        <v-icon>mdi-chevron-down</v-icon>
                                    </v-btn>
                                </v-col>
                                <v-col cols="3" class="p-rel">
                                    <v-btn class="btnMinWidthAuto fill-width p-abs" style="top: -50%; width: calc(100% - 8px);"
                                           :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                           @click="doSendMove('X'+(reverseX ? '-' : '+')+stepsReversed[selectedCrossStep], feedrateXY)"
                                    >
                                        <v-icon>mdi-chevron-right</v-icon>
                                    </v-btn>
                                </v-col>
                                <v-col cols="3">
                                    <v-btn class="btnMinWidthAuto fill-width"
                                           :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                                           @click="doSendMove('Z'+(!reverseZ ? '-' : '+')+stepsReversed[selectedCrossStep], feedrateZ)"
                                    >
                                        <v-icon>mdi-chevron-down</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col :cols="homeCols" class="d-flex align-center">
                            <div class="flex-grow-1" style="border-radius: 4px; overflow: hidden;">
                                <v-row dense class="" style="margin-bottom: -2px!important;">
                                    <v-col :cols="'quad_gantry_level' in config || 'z_tilt' in config ? 6 : 12">
                                        <v-btn class="w-100"
                                               tile
                                               @click="doHome"
                                               height="30"
                                               :loading="loadings.includes('homeAll')"
                                               :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                                        >
                                            <div class="d-flex align-center">
                                                <v-icon>mdi-home</v-icon>
                                                <span class="ml-1">ALL</span>
                                            </div>
                                        </v-btn>
                                    </v-col>
                                    <v-col v-if="'quad_gantry_level' in config || 'z_tilt' in config" cols="6" class="d-flex">
                                        <v-btn v-if="'quad_gantry_level' in config"
                                               class="btnMinWidthAuto flex-grow-1 px-0"
                                               tile
                                               dense
                                               color="primary"
                                               height="30"
                                               :loading="loadings.includes('qgl')"
                                               @click="doQGL"
                                        >QGL</v-btn>
                                        <v-btn v-if="'z_tilt' in config"
                                               class="btnMinWidthAuto flex-grow-1 px-0"
                                               tile
                                               dense
                                               color="primary"
                                               height="30"
                                               :loading="loadings.includes('zTilt')"
                                               @click="doZtilt"
                                        >Z-Tilt</v-btn>
                                    </v-col>
                                </v-row>
                                <v-row dense class="">
                                    <v-col cols="4" class="flex-grow-1">
                                        <v-btn class="btnMinWidthAuto w-100"
                                               tile
                                               height="30"
                                               :loading="loadings.includes('homeX')"
                                               :color="homedAxes.includes('x') ? 'primary' : 'warning'"
                                               @click="doHomeX"
                                        >
                                            X
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="4" class="flex-grow-1">
                                        <v-btn class="btnMinWidthAuto w-100"
                                               tile
                                               height="30"
                                               :loading="loadings.includes('homeY')"
                                               :color="homedAxes.includes('y') ? 'primary' : 'warning'"
                                               @click="doHomeY"
                                        >
                                            Y
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="4" class="flex-grow-1">
                                        <v-btn class="btnMinWidthAuto w-100"
                                               tile
                                               height="30"
                                               :loading="loadings.includes('homeZ')"
                                               :color="homedAxes.includes('z') ? 'primary' : 'warning'"
                                               @click="doHomeZ"
                                        >
                                            Z
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="col-12">
                            <v-btn-toggle v-if="stepsReversed.length > 0" dense no-gutters style="flex-wrap: nowrap; width: 100%;" v-model="selectedCrossStep">
                                <v-btn dense class="btnMinWidthAuto flex-grow-1 px-0" v-for="steps of stepsReversed" :key="'all-'+steps">
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
                        <v-col class="col-12  pb-0 text-center">
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
                <template v-if="existsExtruder">
                    <v-row>
                        <v-col class="pa-0">
                            <v-divider></v-divider>
                        </v-col>
                    </v-row>
                    <v-row class="">
                        <v-col class="col col-md-6 pt-2">
                            <span class="text--disabled" style="font-size: .9em">Feed amount [mm]</span>
                            <v-btn-toggle class="mt-1" dense no-gutters style="flex-wrap: nowrap; width: 100%;" >
                                <v-btn v-for="amount in feedamountsSorted" v-bind:key="amount" @click="setFeedAmount(amount)" dense :class="(amount === currentFeedAmount ? 'v-btn--active' : '') + ' btnMinWidthAuto flex-grow-1 px-0 _btnFeedrate'">{{ amount }}</v-btn>
                            </v-btn-toggle>
                        </v-col>
                        <v-col class="col col-md-6 pt-2">
                            <span class="text--disabled" style="font-size: .9em">Feedrate [mm/s]</span>
                            <v-btn-toggle class="mt-1" dense no-gutters style="flex-wrap: nowrap; width: 100%;" >
                                <v-btn v-for="rate in feedratesSorted" v-bind:key="rate" @click="setFeedrate(rate)" dense :class="(rate === currentFeedRate ? 'v-btn--active' : '') + ' btnMinWidthAuto flex-grow-1 px-0 _btnFeedrate'">{{ rate }}</v-btn>
                            </v-btn-toggle>
                        </v-col>
                    </v-row>
                    <v-row class="">
                        <v-col class="col text-center pt-0">
                            <v-btn small @click="sendRetract()" class="mx-3" :loading="loadings.includes('btnRetract')" :disabled="!this['printer/getExtrudePossible']"><v-icon small class="mr-1">mdi-arrow-up-bold</v-icon> Retract</v-btn>
                            <v-btn small @click="sendDetract()" class="mx-3" :loading="loadings.includes('btnDetract')" :disabled="!this['printer/getExtrudePossible']"><v-icon small class="mr-1">mdi-arrow-down-bold</v-icon> Extrude</v-btn>
                        </v-col>
                    </v-row>
                </template>
            </v-container>
        </v-card>
        <v-card class="mt-6" v-if="this['printer/getMacros'].length > 0">
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-code-tags</v-icon>Macros</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-container>
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
            </v-container>
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
                crossHeight: 40,
                homeCols: 6
            }
        },
        computed: {
            ...mapState({
                homedAxes: state => state.printer.toolhead.homed_axes,
                config: state => state.printer.configfile.config,
                loadings: state => state.socket.loadings,
                printer_state: state => state.printer.print_stats.state,
                extruder: state => state.printer.extruder,
                absolute_coordinates: state => state.printer.gcode_move.absolute_coordinates,

                feedamounts: state => state.gui.dashboard.extruder.feedamounts,
                feedrates: state => state.gui.dashboard.extruder.feedrates,

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
                'printer/getExtrudePossible',
            ]),
            reverseX: {
                get() {
                    return this.$store.state.gui.dashboard.control.reverseX;
                },
                set(reverseX) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { reverseX } } })
                }
            },
            reverseY: {
                get() {
                    return this.$store.state.gui.dashboard.control.reverseZ;
                },
                set(reverseY) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { reverseY } } })
                }
            },
            reverseZ: {
                get() {
                    return this.$store.state.gui.dashboard.control.reverseZ;
                },
                set(reverseZ) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { reverseZ } } })
                }
            },
            useCross: {
                get() {
                    return this.$store.state.gui.dashboard.control.useCross;
                },
                set(useCross) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { useCross } } })
                }
            },
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
            },
            existsExtruder: {
                get() {
                    return 'extruder' in this.$store.state.printer
                }
            },
            feedamountsSorted: {
                get() {
                    return [...this.feedamounts].sort((a,b) => { return b-a })
                }
            },
            feedratesSorted: {
                get() {
                    return [...this.feedrates].sort((a,b) => { return b-a })
                }
            },
            currentFeedAmount: {
                get() {
                    return parseFloat(this.$store.state.gui.dashboard.extruder.feedamount)
                },
                set(newVal) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { extruder: { feedamount: newVal } } })
                }
            },
            currentFeedRate: {
                get() {
                    return parseFloat(this.$store.state.gui.dashboard.extruder.feedrate)
                },
                set(newVal) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { extruder: { feedrate: newVal } } })
                }
            }
        },
        created() {
            window.addEventListener('resize', this.onResize);
        },
        mounted() {
            if (window.screen.width < 330) {
                this.homeCols = 12;
            }
        },
        destroyed() {
            window.removeEventListener('resize', this.onResize);
        },
        methods: {
            onResize() {
                this.homeCols = window.screen.width < 360 ? 12 : 6;
            },
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
                if (this.absolute_coordinates) {
                    gcode = "G91" + "\n" +
                        "G1 " + gcode + " F"+feedrate*60 + "\n" +
                        "G90"
                } else gcode = "G1 " + gcode + " F"+feedrate*60

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
            setFeedAmount(value) {
                this.currentFeedAmount = value;
            },
            setFeedrate(value) {
                this.currentFeedRate = value;
            },
            sendRetract() {
                let gcode = "M83\nG1 E-"+this.currentFeedAmount+" F"+(this.currentFeedRate * 60);
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'btnRetract' });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'btnRetract' });
            },
            sendDetract() {
                let gcode = "M83\nG1 E"+this.currentFeedAmount+" F"+(this.currentFeedRate * 60);
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'btnDetract' });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'btnDetract' });
            },
        },
    }
</script>
