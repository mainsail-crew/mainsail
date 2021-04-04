<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading">
                    <v-icon left>mdi-webcam</v-icon> {{ $t('Panels.WebcamPanel.Webcam')}}
                </span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-item-group v-if="this.webcams.length > 1">
                <v-menu :offset-y="true" title="Webcam">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn small class="px-2 minwidth-0" color="primary" v-bind="attrs" v-on="on">
                            <v-icon small v-if="'icon' in currentCam" class="mr-2">{{ currentCam.icon }}</v-icon>
                            {{ 'name' in currentCam ? currentCam.name : "unknown" }}
                            <v-icon small>mdi-menu-down</v-icon>
                        </v-btn>
                    </template>
                    <v-list dense class="py-0">
                        <v-list-item link @click="currentCamName = 'all'">
                            <v-list-item-icon class="mr-0">
                                <v-icon small>mdi-view-grid</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ $t('Panels.WebcamPanel.All') }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item v-for="webcam of this.webcams" v-bind:key="webcam.index" link @click="currentCamName = webcam.name">
                            <v-list-item-icon class="mr-0">
                                <v-icon small>{{ webcam.icon }}</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title v-text="webcam.name"></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-item-group>
        </v-toolbar>
        <v-card-text class="px-0 py-0 content d-inline-block">
            <v-row>
                <v-col class="pb-0" style="position: relative;">
                    <template v-if="'service' in this.currentCam && this.currentCam.service === 'grid'">
                        <webcam-grid :webcams="this.webcams"></webcam-grid>
                    </template>
                    <template v-else-if="'service' in this.currentCam && this.currentCam.service === 'mjpegstreamer'">
                        <webcam-mjpegstreamer :cam-settings="this.currentCam"></webcam-mjpegstreamer>
                    </template>
                    <template v-else-if="'service' in this.currentCam && this.currentCam.service === 'mjpegstreamer-adaptive'">
                        <webcam-mjpegstreamer-adaptive :cam-settings="this.currentCam"></webcam-mjpegstreamer-adaptive>
                    </template>
                    <template v-else-if="'service' in this.currentCam && this.currentCam.service === 'ipstream'">
                        <webcam-ipstreamer :cam-settings="this.currentCam"></webcam-ipstreamer>
                    </template>
                    <template v-else>
                        <p class="text-center py-3 font-italic">{{ $t('Panels.WebcamPanel.UnknownWebcamService') }}</p>
                    </template>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import Mjpegstreamer from "@/components/webcams/Mjpegstreamer"
    import MjpegstreamerAdaptive from "@/components/webcams/MjpegstreamerAdaptive"
    import Ipstreamer from "@/components/webcams/Ipstreamer"
    import WebcamGrid from "@/components/webcams/WebcamGrid"

    export default {
        components: {
            'webcam-mjpegstreamer': Mjpegstreamer,
            'webcam-mjpegstreamer-adaptive': MjpegstreamerAdaptive,
            'webcam-ipstreamer': Ipstreamer,
            'webcam-grid': WebcamGrid,
        },
        data: function() {
            return {

            };
        },
        computed: {
            currentCamName: {
                get() {
                    let currentCamName = this.$store.state.gui.webcam.selectedCam
                    if (currentCamName !== undefined && this.webcams.findIndex(webcam => webcam.name === currentCamName) !== -1)
                        return currentCamName

                    if (currentCamName !== undefined && Array.isArray(this.webcams) && this.webcams.length === 1)
                        return this.webcams[0].name

                    return "all"
                },
                set(newVal) {
                    return this.$store.dispatch('gui/setSettings', { webcam: { selectedCam: newVal } })
                }
            },
            currentCam() {
                if (this.currentCamName === 'all') {
                    return {
                        name: this.$t('Panels.WebcamPanel.All'),
                        service: "grid",
                        icon: "mdi-view-grid",
                    }
                } else {
                    const currentCam = this.webcams.find(webcam => webcam.name === this.currentCamName)
                    if (currentCam) return currentCam
                }

                return {}
            },
            webcams: {
                get() {
                    return this.$store.getters["gui/getWebcams"]
                }
            },
        }
    }
</script>