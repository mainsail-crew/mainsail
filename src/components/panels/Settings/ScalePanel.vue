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
        <v-card-text class="py-3">
            <v-row>
                <v-col class="py-0">
                    <v-text-field
                        v-model="scaleOffset"
                        hide-details
                        label="Offset"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="py-0">
                    <v-text-field
                        v-model="scalePosition"
                        hide-details
                        label="Position"
                    ></v-text-field>
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
                <v-col class="py-0">
                    <v-btn v-on:click="executeTare" rounded color="blue-grey darken-3">Tare</v-btn>
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
            scaleOffset: {
                get() {
                    return this.$store.state.gui.scale.offset;
                },
                set(offset) {
                    return this.$store.dispatch('gui/setSettings', { scale: { offset } });
                }
            },
            scalePosition: {
                get() {
                    return this.$store.state.gui.scale.position;
                },
                set(position) {
                    return this.$store.dispatch('gui/setSettings', { scale: { position } });
                }
            },
            rawValue: {
                get() {
                    return this.$store.state.gui.scale.raw;
                },
                set(raw) {
                    return this.$store.dispatch('gui/setSettings', { scale: { raw } });
                }
            },
        },
        methods: {
            executeTare:function(){
                var tare = this.$store.state.gui.scale.raw;
                this.$store.dispatch('gui/setSettings', { scale: { tare } });
            }
        }
    }
</script>