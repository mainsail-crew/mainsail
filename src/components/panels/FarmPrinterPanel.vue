<style>
    .v-card.disabledPrinter {
        opacity: 0.6;
        filter: grayscale(70%);
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
        </v-toolbar>
        <v-img
            height="200px"
            :src="printer_image"
            class="d-flex align-end"
        >
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

    export default {
        components: {

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
            isCurrentPrinter: {
                get() {
                    return this.$store.getters["farm/"+this.printer._namespace+"/isCurrentPrinter"]
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
            }
        },
        methods: {
            clickPrinter() {
                if (this.printer.socket.isConnected) this.changePrinter()
                else this.reconnectPrinter()
            },
            changePrinter() {
                if (this.remoteMode) this.$store.dispatch('changePrinter', { printer: this.printer._namespace })
                else window.location.href = "//"+this.printer.socket.hostname+(parseInt(this.printer.socket.webPort) !== 80 ? ':'+this.printer.socket.webPort : '')
            },
            reconnectPrinter() {
                this.$store.dispatch("farm/"+this.printer._namespace+"/reconnect")
            }
        }
    }
</script>