<style>
    .content { overflow: hidden; }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-scale</v-icon>Scale</span>
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
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="scaleOffset2"
                                hide-details
                                label="Offset"
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
                            ></v-text-field>
                        </v-col>
                        <v-col class="py-0">
                            <v-text-field
                                v-model="scalePosition2"
                                hide-details
                                label="Position"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row>
                <br>
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
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3">
                            <v-btn v-on:click="executeTare1" rounded color="blue-grey darken-3">Tare</v-btn>
                        </v-col>
                        <v-col class="py-0 px-3">
                            <v-btn v-on:click="executeTare2" rounded color="blue-grey darken-3">Tare</v-btn>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        components: {

        },
        data: function() {
            return {
                rotationEnabled: false
            }
        },
        computed: {
            scaleOffset1: {
                get() {
                    return this.$store.state.gui.scale.offset1;
                },
                set(offset1) {
                    return this.$store.dispatch('gui/setSettings', { scale: { offset1 } });
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