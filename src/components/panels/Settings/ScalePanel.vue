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
        <v-card-text>
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
                <br>
            </v-row>
            <v-row>
                <v-col class="py-0">
                    <v-btn v-model="boolNavi" rounded color="blue-grey darken-3">Tare</v-btn>
                    <v-btn v-model="boolNavi" rounded color="blue-grey darken-3" style="margin-left: 10px;">Apply Offset</v-btn>
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
            webcamUrl: {
                get() {
                    return this.$store.state.gui.webcam.url;
                },
                set(url) {
                    return this.$store.dispatch('gui/setSettings', { webcam: { url } });
                }
            },
            flipX: {
                get() {
                    return this.$store.state.gui.webcam.flipX;
                },
                set(flipX) {
                    return this.$store.dispatch('gui/setSettings', { webcam: { flipX } });
                }
            },
            flipY: {
                get() {
                    return this.$store.state.gui.webcam.flipY;
                },
                set(flipY) {
                    return this.$store.dispatch('gui/setSettings', { webcam: { flipY } });
                }
            },
            rotate: {
                get() {
                    return this.$store.state.gui.webcam.rotate;
                },
                set(rotate) {
                    return this.$store.dispatch('gui/setSettings', { webcam: { rotate } });
                }
            },
            rotateDegrees: {
                get() {
                    return this.$store.state.gui.webcam.rotateDegrees;
                },
                set(rotateDegrees) {
                    return this.$store.dispatch('gui/setSettings', { webcam: { rotateDegrees } });
                }
            },
            boolNavi: {
                get() {
                    return this.$store.state.gui.webcam.bool;
                },
                set(showNav) {
                    return this.$store.dispatch('gui/setSettings', { webcam: { bool: showNav } });
                }
            },
        },
        methods: {

        }
    }
</script>