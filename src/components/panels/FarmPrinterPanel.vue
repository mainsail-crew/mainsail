<style>
    .v-card.disabledPrinter {
        opacity: 0.6;
        filter: grayscale(70%);
    }

    .webcamContainer,
    .webcamContainer .vue-load-image,
    .webcamContainer>div,
    .webcamContainer img {
        position: absolute !important;
        top: 0; left: 0; right: 0; bottom: 0;
    }

    .webcamContainer img {
        height: 100%;
    }

    .webcamContainer .webcamFpsOutput {
        display: none;
    }
</style>

<template>
    <v-card
        :class="(!printer.socket.isConnected && !printer.socket.isConnecting ? 'disabledPrinter' : '')"
        :loading="printer.socket.isConnecting"
        @click="clickPrinter"
    >
        <v-toolbar flat dense :color="isCurrentPrinter ? 'primary' : ''">
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-printer-3d</v-icon>{{ printer_name }}</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-item-group v-if="this.printer_webcams.length">
                <v-menu :offset-y="true" title="Webcam">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn small class="px-2 minwidth-0" color="grey darken-3" v-bind="attrs" v-on="on">
                            <v-icon small>mdi-webcam</v-icon>
                            <v-icon small>mdi-menu-down</v-icon>
                        </v-btn>
                    </template>
                    <v-list dense class="py-0">
                        <v-list-item link @click="currentCamName = 'off'">
                            <v-list-item-icon class="mr-0">
                                <v-icon small>mdi-webcam-off</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ $t('Panels.FarmPrinterPanel.WebcamOff') }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item v-for="webcam of this.printer_webcams" v-bind:key="webcam.index" link @click="currentCamName = webcam.name">
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
        <v-img
            height="200px"
            :src="printer_image"
            class="d-flex align-end"
        >
            <div v-if="currentCamName !== 'off' && currentWebcam" class="webcamContainer">
                <template v-if="'service' in currentWebcam && currentWebcam.service === 'mjpegstreamer'">
                    <webcam-mjpegstreamer :cam-settings="currentWebcam"></webcam-mjpegstreamer>
                </template>
                <template v-if="'service' in currentWebcam && currentWebcam.service === 'mjpegstreamer-adaptive'">
                    <webcam-mjpegstreamer-adaptive :cam-settings="currentWebcam" :printer-url="printerUrl"></webcam-mjpegstreamer-adaptive>
                </template>
            </div>
            <v-card-title class="white--text py-2" style="background-color: rgba(0,0,0,0.3); backdrop-filter: blur(3px);">
                <v-row>
                    <v-col class="col-auto pr-0 d-flex align-center" style="width: 58px">
                        <img class="my-auto" :src="printer_logo" style="width: 100%;" />
                    </v-col>
                    <v-col class="col" style="width: 100px">
                        <h3 class="font-weight-regular">{{ printer_status }}</h3>
                        <span class="subtitle-2 text-truncate px-0 text--disabled d-block" v-if="printer_current_filename !== ''"><v-icon small class="mr-1">mdi-file-outline</v-icon>{{ printer_current_filename }}</span>
                    </v-col>
                </v-row>
            </v-card-title>
        </v-img>
        <v-card-text class="px-0 py-2" v-if="printer_preview.length">
            <v-container class="py-0">
                <v-row>
                    <v-col :class="object.name === 'ETA' ? 'col-auto' : 'col' + ' px-2'" v-for="object in printer_preview" v-bind:key="object.name">
                        <strong class="d-block text-center">{{ object.name }}</strong>
                        <span class="d-block text-center">{{ object.value }}</span>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'
    import Mjpegstreamer from "@/components/webcams/Mjpegstreamer"
    import MjpegstreamerAdaptive from "@/components/webcams/MjpegstreamerAdaptive"

    export default {
        components: {
            "webcam-mjpegstreamer": Mjpegstreamer,
            "webcam-mjpegstreamer-adaptive": MjpegstreamerAdaptive,
        },
        data: function() {
            return {

            }
        },
        props: {
            printer: {
                type: Object,
                required: true,
            },
        },
        computed: {
            ...mapState({
                remoteMode: state => state.socket.remoteMode
            }),
            printerUrl() {
                const thisUrl = window.location.href.split("/")
                const protocol = thisUrl[0]

                let url = protocol+"//"+this.printer.socket.hostname
                if (80 !== parseInt(this.printer.socket.webPort)) url += ":"+this.printer.socket.webPort

                return url
            },
            isCurrentPrinter: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/isCurrentPrinter"]
                }
            },
            currentCamName: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/getSetting"]('currentCamName', 'off')
                },
                set(newVal) {
                    return this.$store.dispatch("farm/"+this.printer._namespace+"/setSettings", { currentCamName: newVal })
                }
            },
            printer_name: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/getPrinterName"]
                }
            },
            printer_status: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/getStatus"]
                }
            },
            printer_current_filename: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/getCurrentFilename"]
                }
            },
            printer_image: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/getImage"]
                }
            },
            printer_logo: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/getLogo"]
                }
            },
            printer_position: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/getPosition"]
                }
            },
            printer_preview: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/getPrinterPreview"]
                }
            },
            printer_webcams: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/getPrinterWebcams"]
                }
            },
            currentWebcam: {
                get() {
                    const currentCam = this.printer_webcams.find(webcam => webcam.name === this.currentCamName)
                    if (currentCam) return currentCam

                    return false
                }
            }
        },
        methods: {
            clickPrinter() {
                if (this.printer.socket.isConnected) this.changePrinter()
                else this.reconnectPrinter()
            },
            changePrinter() {
                if (this.remoteMode) this.$store.dispatch('changePrinter', { printer: this.printer._namespace })
                else window.location.href = this.printerUrl
            },
            reconnectPrinter() {
                this.$store.dispatch("farm/"+this.printer._namespace+"/reconnect")
            }
        }
    }
</script>