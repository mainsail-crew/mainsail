<style>
    .content { overflow: hidden; }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-webcam</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Webcam</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pt-3 content">
            <v-row>
                <v-col class="px-10 py-0">
                    <v-text-field
                        v-model="webcamUrl"
                        hide-details
                        label="Webcam URL"
                    ></v-text-field>

                    <v-row v-if="rotationEnabled">
                        <v-col sm="auto">
                            <v-switch v-model="rotate" hide-details label="Rotate"></v-switch>
                        </v-col>
                        <v-col>
                            <v-select :items="[{ text: '90 degrees', value: 90 }, { text: '270 degrees', value: 270 }]" v-model="rotateDegrees" hide-details></v-select>
                        </v-col>
                    </v-row>
                    
                    <v-switch v-model="flipX" hide-details label="Flip webcam horizontally"></v-switch>
                    <v-switch v-model="flipY" hide-details label="Flip webcam vertically"></v-switch>
                    <v-switch v-model="boolNavi" hide-details label="Show in navigation"></v-switch>
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