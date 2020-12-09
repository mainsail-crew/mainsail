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
                        <v-col class="px-3 py-0">
                            <v-text-field
                                v-model="profile.material"
                                hide-details
                                label="Material"
                                @click.native="show"
                                @blur="hide"
                                data-layout="normal"
                                class="preheat-setting-panel"
                            ></v-text-field>
                        </v-col>
                    </v-col>
                    <v-col class="equal-width py-0 px-0">
                        <v-col class="px-3 py-0">
                            <v-text-field
                                v-model="profile.heater"
                                hide-details
                                label="Heater Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                                append-icon="mdi-temperature-celsius"
                            ></v-text-field>
                        </v-col>
                    </v-col>
                    <v-col class="equal-width py-0 px-0">
                        <v-col class="px-3 py-0">
                            <v-text-field
                                v-model="profile.bed"
                                hide-details
                                label="Bed Temp"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric"
                                class="preheat-setting-panel"
                                append-icon="mdi-temperature-celsius"
                            ></v-text-field>
                        </v-col>
                    </v-col>
                </v-row>
            </div>
            
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