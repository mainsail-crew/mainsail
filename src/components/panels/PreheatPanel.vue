<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-flame</v-icon>Preheat Button</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-0 py-0 content">
            <v-row class="text-center pt-2" align="center">
                <v-col class="py-0 flex-grow-0 pl-8 pr-10">
                    
                </v-col>
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0"><strong>Material</strong></v-col></v-row>
                </v-col>
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0"><strong>Heater Temp</strong></v-col></v-row>
                </v-col>
                <v-col class="equal-width py-0 pr-sm-6">
                    <v-row><v-col class="px-0 py-0"><strong>Bed Temp</strong></v-col></v-row>
                </v-col>
            </v-row>
            <div v-for="n in parseInt(5)" :key="n">
                <v-divider class="my-2"></v-divider>
                <v-row class="text-center py-1 pb-2" align="center">
                    <v-col class="py-0 flex-grow-0 pl-8 pr-3">
                        <v-icon>mdi-numeric-2-circle</v-icon>
                    </v-col>
                    <v-col class="equal-width py-0 px-0">
                        <v-row><v-col class="px-0 py-0">{{getHeaterTemp(n)}}</v-col></v-row>
                    </v-col>
                </v-row>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
    import {bus} from "../../main";

    export default {
        components: {

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
            getMaterial:function(id){
                return this.$store.state.gui.preheatbutton.['material'+id]
            },
            getBedTemp:function(id){
                return this.$store.state.gui.preheatbutton.['bed'+id]
            },
            getHeaterTemp:function(id){
                return this.$store.state.gui.preheatbutton.['heater'+id]
            },
            show:function(e){
                bus.$emit("showkeyboard",e);
            },
            hide:function(){
                bus.$emit("hidekeyboard");
            }
        },
    }
</script>