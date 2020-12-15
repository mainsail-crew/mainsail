<style>
    .content { overflow: hidden; }
</style>

<template>
    <div>
        <v-card>
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-scale</v-icon>Scale</span>
                    <span class="subheading" v-if="!scaleAviable" style="color:#D32F2F;">  Module not found!</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="px-3 py-3 content">
                <v-row class="text-center" align="center">
                    <v-col class="py-0 px-3 equal-width">
                        <v-row>
                            <v-col class="py-0">
                                <strong>
                                    Scale 1
                                </strong>
                            </v-col>
                            <v-col class="py-0">
                                <strong>
                                    Scale 2
                                </strong>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="py-0 px-3 equal-width">
                        <v-row>
                            <v-col class="py-0">
                                <v-text-field
                                    v-model="scaleOffset1"
                                    hide-details
                                    label="Offset"
                                    @click.native="show"
                                    @blur="hide"
                                    data-layout="numeric"
                                    append-icon="mdi-weight-gram"
                                ></v-text-field>
                            </v-col>
                            <v-col class="py-0">
                                <v-text-field
                                    v-model="scaleOffset2"
                                    hide-details
                                    label="Offset"
                                    @click.native="show"
                                    @blur="hide"
                                    data-layout="numeric"
                                    append-icon="mdi-weight-gram"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="py-0 px-3 equal-width">
                        <v-row>
                            <v-col class="py-0">
                                <v-text-field
                                    v-model="scalePosition1"
                                    hide-details
                                    label="Position"
                                    @click.native="show"
                                    @blur="hide"
                                    data-layout="normal"
                                    append-icon="mdi-map-marker"
                                ></v-text-field>
                            </v-col>
                            <v-col class="py-0">
                                <v-text-field
                                    v-model="scalePosition2"
                                    hide-details
                                    label="Position"
                                    @click.native="show"
                                    @blur="hide"
                                    data-layout="normal"
                                    append-icon="mdi-map-marker"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="py-5 px-3 equal-width">
                        <v-row>
                            <v-col class="py-0 px-3">
                                <v-btn v-on:click="executeTare1" rounded color="blue-grey darken-4" style="width: 100%">Tare</v-btn>
                            </v-col>
                            <v-col class="py-0 px-3">
                                <v-btn v-on:click="executeTare2" rounded color="blue-grey darken-4" style="width: 100%">Tare</v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="py-0 px-3 equal-width">
                        <v-row>
                            <v-col class="py-0">
                                <v-text-field
                                    v-model="scaleCalibrate1"
                                    hide-details
                                    label="Known Weight"
                                    @click.native="show"
                                    @blur="hide"
                                    data-layout="numeric"
                                    append-icon="mdi-weight-gram"
                                ></v-text-field>
                            </v-col>
                            <v-col class="py-0">
                                <v-text-field
                                    v-model="scaleCalibrate2"
                                    hide-details
                                    label="Known Weight"
                                    @click.native="show"
                                    @blur="hide"
                                    data-layout="numeric"
                                    append-icon="mdi-weight-gram"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <!--<v-row><v-col class="py-0">
                        <v-text-field
                            v-model="rawValue"
                            hide-details
                            label="raw DEV ONLY"
                        ></v-text-field>
                    </v-col>
                </v-row>-->
                <v-row>
                    <v-col class="pt-3 py-0 px-3 equal-width">
                        <v-row>
                            <v-col class="py-0 px-3">
                                <v-btn v-on:click="executeCalibrate1" rounded color="blue-grey darken-4" style="width: 100%">Cal</v-btn>
                            </v-col>
                            <v-col class="py-0 px-3">
                                <v-btn v-on:click="executeCalibrate2" rounded color="blue-grey darken-4" style="width: 100%">Cal</v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                
                <v-row>
                    <v-col class="pt-3 py-0 px-3 equal-width">
                            <v-col class="py-0 px-0">
                                <v-btn @click="dialogCalibrateGuide.show = true" rounded color="blue-grey darken-4" style="width: 100%">Guide</v-btn>
                            </v-col>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        
        <v-dialog v-model="dialogCalibrateGuide.show" max-width="535">
            <v-card>
                <v-card-title class="headline">Calibrate Guide</v-card-title>
                <v-card-text>
                <v-row>
                    <v-col class="py-0 px-3 equal-width">
                        <v-row>
                                <v-col class="py-0 px-3">
                                            1. Press "TARE" with a empty scale <br>
                                            2. Put a known weight on the scale <br>
                                            3. Put the weight in "Known Weight" <br>
                                            4. Press "CAL" 
                                </v-col>
                                <v-col class="py-0 px-1">
                                           <img :src="require('../../../assets/scaleGuide.gif')" style="width: 250px;">
                                </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCalibrateGuide.show = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {bus} from "../../../main";
    export default {
        components: {
        },
        data: function() {
            return {
                dialogCalibrateGuide: {
                    show: false,
                },
            }
        },
        computed: {
            scaleAviable: {
                get() {
                    return this.$store.state.gui.dashboard.boolScaleAvailable;
                }
            },
            scaleOffset1: {
                get() {
                    return this.$store.state.gui.scale.offset1;
                },
                set(offset1) {
                    return this.$store.dispatch('gui/setSettings', { scale: { offset1 } });
                }
            },
            scaleCalibrate1: {
                get() {
                    return this.$store.state.gui.scale.calibrateweight1;
                },
                set(calibrateweight1) {
                    return this.$store.state.gui.scale.calibrateweight1=calibrateweight1;
                }
            },
            scalePosition1: {
                get() {
                    return this.$store.state.gui.scale.position1;
                },
                set(position1) {
                    return this.$store.dispatch('gui/setSettings', { scale: { position1 } });
                }
            },
            scaleOffset2: {
                get() {
                    return this.$store.state.gui.scale.offset2;
                },
                set(offset2) {
                    return this.$store.dispatch('gui/setSettings', { scale: { offset2 } });
                }
            },
            scaleCalibrate2: {
                get() {
                    return this.$store.state.gui.scale.calibrateweight2;
                },
                set(calibrateweight2) {
                    return this.$store.state.gui.scale.calibrateweight2=calibrateweight2;
                }
            },
            scalePosition2: {
                get() {
                    return this.$store.state.gui.scale.position2;
                },
                set(position2) {
                    return this.$store.dispatch('gui/setSettings', { scale: { position2 } });
                }
            },
        },
        methods: {
            show:function(e){
                bus.$emit("showkeyboard",e);
            },
            hide:function(){
                bus.$emit("hidekeyboard");
            },
            executeTare1:function(){
                var tare1 = this.$store.state.gui.scale.raw1
                this.$store.dispatch('gui/setSettings', { scale: { tare1 } });
            },
            executeTare2:function(){
                var tare2 = this.$store.state.gui.scale.raw2
                this.$store.dispatch('gui/setSettings', { scale: { tare2 } });
            },
            executeCalibrate1:function(){
                var referenceunit1 = (this.$store.state.gui.scale.raw1 -this.$store.state.gui.scale.tare1) / this.$store.state.gui.scale.calibrateweight1;
                this.$store.dispatch('gui/setSettings', { scale: { referenceunit1 } });
            },
            executeCalibrate2:function(){
                var referenceunit2 = (this.$store.state.gui.scale.raw2 -this.$store.state.gui.scale.tare2) / this.$store.state.gui.scale.calibrateweight2;
                this.$store.dispatch('gui/setSettings', { scale: { referenceunit2 } });
            }
        }
    }
</script>