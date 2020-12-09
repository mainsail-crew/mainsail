<style>
    .content { overflow: hidden; }
</style>

<template>
    <v-card style="margin-top:25px">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-fire</v-icon>Preheat Button</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-3 py-3 content">
            <v-row class="text-center" align="center">
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0">
                            <strong>
                                Material
                            </strong>
                        </v-col>
                        <v-col class="py-0">
                            <strong>
                                Heater Temp
                            </strong>
                        </v-col>
                        <v-col class="py-0">
                            <strong>
                                Bed Temp
                            </strong>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <div v-for="profile in this.$store.state.gui.preheatbutton.profiles" :key="profile.id">
                <v-divider class="my-2"></v-divider>
                <v-row class="text-center py-1 pb-2" align="center">
                    <v-col class="equal-width py-0 px-0">
                        <v-row><v-col class="px-0 py-0">{{profile.material}}</v-col></v-row>
                    </v-col>
                    <v-col class="equal-width py-0 px-0">
                        <v-row><v-col class="px-0 py-0">{{profile.heater}}</v-col></v-row>
                    </v-col>
                    <v-col class="equal-width py-0 px-0">
                        <v-row><v-col class="px-0 py-0">{{profile.bed}}</v-col></v-row>
                    </v-col>
                </v-row>
            </div>
            <v-row>
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="material1"
                                hide-details
                                label="Material"
                                @click.native="show"
                                @blur="hide"
                                data-layout="normal"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="heater1"
                                hide-details
                                label="Heater Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="bed1"
                                hide-details
                                label="Bed Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-divider class="my-2"></v-divider>
            <v-row>
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="material2"
                                hide-details
                                label="Material"
                                @click.native="show"
                                @blur="hide"
                                data-layout="normal"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="heater2"
                                hide-details
                                label="Heater Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="bed2"
                                hide-details
                                label="Bed Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-divider class="my-2"></v-divider><v-row>
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="material3"
                                hide-details
                                label="Material"
                                @click.native="show"
                                @blur="hide"
                                data-layout="normal"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="heater3"
                                hide-details
                                label="Heater Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="bed3"
                                hide-details
                                label="Bed Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-divider class="my-2"></v-divider><v-row>
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="material4"
                                hide-details
                                label="Material"
                                @click.native="show"
                                @blur="hide"
                                data-layout="normal"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="heater4"
                                hide-details
                                label="Heater Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="bed4"
                                hide-details
                                label="Bed Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-divider class="my-2"></v-divider><v-row>
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="material5"
                                hide-details
                                label="Material"
                                @click.native="show"
                                @blur="hide"
                                data-layout="normal"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="heater5"
                                hide-details
                                label="Heater Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="bed5"
                                hide-details
                                label="Bed Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row>
                <br/>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import {bus} from "../../../main";
    export default {
        components: {

        },
        data: function() {
            return {
                rotationEnabled: false
            }
        },
        computed: {
            material1: {
                get() {
                    return this.$store.state.gui.preheatbutton.material1;
                },
                set(material1) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { material1 } });
                }
            },
            heater1: {
                get() {
                    return this.$store.state.gui.preheatbutton.heater1;
                },
                set(heater1) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { heater1 } });
                }
            },
            bed1: {
                get() {
                    return this.$store.state.gui.preheatbutton.bed1;
                },
                set(bed1) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { bed1 } });
                }
            },
            material2: {
                get() {
                    return this.$store.state.gui.preheatbutton.material2;
                },
                set(material2) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { material2 } });
                }
            },
            heater2: {
                get() {
                    return this.$store.state.gui.preheatbutton.heater2;
                },
                set(heater2) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { heater2 } });
                }
            },
            bed2: {
                get() {
                    return this.$store.state.gui.preheatbutton.bed2;
                },
                set(bed2) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { bed2 } });
                }
            },
            material3: {
                get() {
                    return this.$store.state.gui.preheatbutton.material3;
                },
                set(material3) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { material3 } });
                }
            },
            heater3: {
                get() {
                    return this.$store.state.gui.preheatbutton.heater3;
                },
                set(heater3) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { heater3 } });
                }
            },
            bed3: {
                get() {
                    return this.$store.state.gui.preheatbutton.bed3;
                },
                set(bed3) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { bed3 } });
                }
            },
            material4: {
                get() {
                    return this.$store.state.gui.preheatbutton.material4;
                },
                set(material4) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { material4 } });
                }
            },
            heater4: {
                get() {
                    return this.$store.state.gui.preheatbutton.heater4;
                },
                set(heater4) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { heater4 } });
                }
            },
            bed4: {
                get() {
                    return this.$store.state.gui.preheatbutton.bed4;
                },
                set(bed4) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { bed4 } });
                }
            },
            material5: {
                get() {
                    return this.$store.state.gui.preheatbutton.material5;
                },
                set(material5) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { material5 } });
                }
            },
            heater5: {
                get() {
                    return this.$store.state.gui.preheatbutton.heater5;
                },
                set(heater5) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { heater5 } });
                }
            },
            bed5: {
                get() {
                    return this.$store.state.gui.preheatbutton.bed5;
                },
                set(bed5) {
                    return this.$store.dispatch('gui/setSettings', { preheatbutton: { bed5 } });
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
                var tare1 = this.$store.state.gui.scale.raw1;
                this.$store.dispatch('gui/setSettings', { scale: { tare1 } });
            },
            executeTare2:function(){
                var tare2 = this.$store.state.gui.scale.raw2;
                this.$store.dispatch('gui/setSettings', { scale: { tare2 } });
            }
        }
    }
</script>