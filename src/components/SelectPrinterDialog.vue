<style scoped>

</style>

<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <v-card dark>
            <v-toolbar flat dense color="primary">
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-connection" left></v-icon>
                        <template v-if="dialogAddPrinter.bool">{{ $t("SelectPrinterDialog.AddPrinter") }}</template>
                        <template v-else-if="dialogEditPrinter.bool">{{ $t("SelectPrinterDialog.EditPrinter") }}</template>
                        <template v-else-if="isConnecting">{{ $t("SelectPrinterDialog.Connecting", {'host': formatHostname}) }}</template>
                        <template v-else-if="connectingFailed">{{ $t("SelectPrinterDialog.ConnectionFailed", {'host': formatHostname}) }}</template>
                        <template v-else>{{ $t("SelectPrinterDialog.SelectPrinter") }}</template>
                    </span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <template v-if="!isConnecting && !connectingFailed">
                    <template v-if="dialogEditPrinter.bool"><v-btn small class="minwidth-0" @click="dialogEditPrinter.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn></template>
                    <template v-else-if="dialogAddPrinter.bool"><v-btn small class="minwidth-0" v-if="dialogAddPrinter.bool" @click="dialogAddPrinter.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn></template>
                    <template v-else-if="countPrinters > 0"><v-btn small class="minwidth-0" @click="checkPrinters"><v-icon small>mdi-sync</v-icon></v-btn></template>
                </template>
            </v-toolbar>
            <v-card-text class="pt-5" v-if="isConnecting">
                <v-progress-linear color="white" indeterminate></v-progress-linear>
            </v-card-text>
            <v-card-text class="pt-5" v-if="!isConnecting && connectingFailed">
                <p>{{ $t("SelectPrinterDialog.CannotConnectTo") }} {{ parseInt(port) !== 80 ? hostname+":"+port : hostname }}.</p>
                <div class="text-center">
                    <v-btn @click="switchToChangePrinter" color="white" outlined class="mr-3">{{ $t("SelectPrinterDialog.ChangePrinter") }}</v-btn>
                    <v-btn @click="reconnect" color="primary">{{ $t("SelectPrinterDialog.TryAgain") }}</v-btn>
                </div>
            </v-card-text>
            <v-card-text class="pt-3" v-if="!isConnecting && dialogAddPrinter.bool">
                <v-container class="px-0 py-0">
                    <v-row>
                        <v-col class="col-8">
                            <v-text-field
                                v-model="dialogAddPrinter.hostname"
                                :rules="[
                                    v => !!v || $t('SelectPrinterDialog.HostnameRequired'),
                                    v => !v.startsWith('http:') || $t('SelectPrinterDialog.HostnameInvalid'),
                                    v => !v.startsWith('https:') || $t('SelectPrinterDialog.HostnameInvalid'),
                                ]"
                                label="Hostname/IP"
                                required
                            ></v-text-field>
                        </v-col>
                        <v-col class="col-4">
                            <v-text-field
                                v-model="dialogAddPrinter.port"
                                :rules="[v => !!v || $t('SelectPrinterDialog.PortRequired')]"
                                label="Port"
                                required
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-right">
                            <v-btn
                                color="white"
                                outlined
                                class="middle"
                                @click="addPrinter"
                            >
                                {{ $t("SelectPrinterDialog.AddPrinter") }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-text class="pt-3" v-if="!isConnecting && dialogEditPrinter.bool">
                <v-container class="px-0 py-0">
                    <v-row>
                        <v-col class="col-8">
                            <v-text-field
                                v-model="dialogEditPrinter.hostname"
                                :rules="[
                                    v => !!v || $t('SelectPrinterDialog.HostnameRequired'),
                                    v => !v.startsWith('http:') || $t('SelectPrinterDialog.HostnameInvalid'),
                                    v => !v.startsWith('https:') || $t('SelectPrinterDialog.HostnameInvalid'),
                                ]"
                                label="Hostname/IP"
                                required
                            ></v-text-field>
                        </v-col>
                        <v-col class="col-4">
                            <v-text-field
                                v-model="dialogEditPrinter.port"
                                :rules="[v => !!v || $t('SelectPrinterDialog.PortRequired')]"
                                label="Port"
                                required
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="">
                            <v-btn
                                color="red"
                                outlined
                                class="middle minwidth-0"
                                @click="delPrinter"
                            >
                                <v-icon small>mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col class="text-right">
                            <v-btn
                                color="white"
                                outlined
                                class="middle"
                                @click="updatePrinter"
                            >
                                {{ $t("SelectPrinterDialog.UpdatePrinter") }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-text class="pt-3" v-if="!isConnecting && !connectingFailed && !dialogAddPrinter.bool && !dialogEditPrinter.bool">
                <v-container class="px-0 pb-0">
                    <v-row v-for="(printer, index) in printers" v-bind:key="index">
                        <v-col class="rounded transition-swing secondary py-2 px-2 mb-2" style="cursor: pointer;" @click="connect(printer)">
                            <v-row align="center">
                                <v-col class="col-auto pr-0">
                                    <v-progress-circular
                                        indeterminate
                                        color="primary"
                                        v-if="printer.socket.isConnecting"
                                    ></v-progress-circular>
                                    <v-icon
                                        :color="printer.socket.isConnected ? 'green' : 'red'"
                                        v-if="!printer.socket.isConnecting"
                                    >mdi-{{ printer.socket.isConnected ? 'checkbox-marked-circle' : 'cancel' }}</v-icon>
                                </v-col>
                                <v-col>{{ getPrinterName(printer._namespace) }}</v-col>
                                <v-col class="col-auto"><v-btn small class="minwidth-0" v-on:click.stop.prevent="editPrinter(index)"><v-icon small>mdi-pencil</v-icon></v-btn></v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row v-if="showCorsInfo">
                        <v-col>
                            <p class="text-center" v-if="countPrinters === 0">{{ $t("SelectPrinterDialog.Hello") }}</p>
                            <p class="text-center">{{ $t("SelectPrinterDialog.RememberToAdd", {cors: currentUrl}) }}</p>
                            <p class="text-center mb-0">{{ $t("SelectPrinterDialog.YouCanFindMore") }} <a href="https://docs.mainsail.xyz/remotemode" target="_blank">https://docs.mainsail.xyz/remotemode</a>.</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center mt-0">
                            <v-btn @click="dialogAddPrinter.bool = true">{{ $t("SelectPrinterDialog.AddPrinter") }}</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Vue from "vue";

export default {
    data: function() {
        return {
            dialogAddPrinter: {
                bool: false,
                hostname: "",
                port: 7125
            },
            dialogEditPrinter: {
                bool: false,
                index: 0,
                hostname: "",
                port: 0
            }
        }
    },
    computed: {
        ...mapGetters({
            countPrinters: "farm/countPrinters",
            printers: "farm/getPrinters",
            getPrinterName: "farm/getPrinterName",
        }),
        ...mapActions({
            readPrinters: "farm/readStoredPrinters"
        }),
        remoteMode() {
            return this.$store.state.socket.remoteMode
        },
        protocol() {
            return this.$store.state.socket.protocol
        },
        hostname() {
            return this.$store.state.socket.hostname
        },
        port() {
            return this.$store.state.socket.port
        },
        formatHostname() {
            return parseInt(this.port) !== 80 && this.port !== "" ? this.hostname+":"+this.port : this.hostname
        },
        isConnected() {
            return this.$store.state.socket.isConnected
        },
        isConnecting() {
            return this.$store.state.socket.isConnecting
        },
        connectingFailed() {
            return this.$store.state.socket.connectingFailed
        },
        showDialog() {
            return !this.isConnected
        },
        currentUrl() {
            return "http://"+window.location.hostname+(window.location.port !== 80 && window.location.port !== '' ? ':'+window.location.port : '')
        },
        showCorsInfo() {
            if (this.countPrinters) {
                for (const [ ,printer] of Object.entries(this.printers)) {
                    if (!printer.socket.isConnected) return true
                }

                return false
            }

            return true
        }
    },
    methods: {
        addPrinter() {
            this.$store.commit('farm/addPrinter',{
                hostname: this.dialogAddPrinter.hostname,
                port: this.dialogAddPrinter.port,
                protocol: this.protocol
            })

            this.dialogAddPrinter.hostname = ""
            this.dialogAddPrinter.bool = false

            this.$store.dispatch("farm/savePrinters")
        },
        editPrinter(index) {
            this.dialogEditPrinter.hostname = this.printers[index].socket.hostname
            this.dialogEditPrinter.port = this.printers[index].socket.port
            this.dialogEditPrinter.index = index
            this.dialogEditPrinter.bool = true
        },
        updatePrinter() {
            this.$store.commit("farm/"+this.dialogEditPrinter.index+"/setSocketData", {
                hostname: this.dialogEditPrinter.hostname,
                port: this.dialogEditPrinter.port,
                isConnecting: true,
            })
            this.$store.dispatch("farm/"+this.dialogEditPrinter.index+"/reconnect")
            this.dialogEditPrinter.bool = false

            this.checkPrinters()
        },
        delPrinter() {
            this.$store.commit("farm/removePrinter", { name: this.dialogEditPrinter.index })
            this.$store.dispatch("farm/savePrinters")
            this.dialogEditPrinter.bool = false
        },
        connect(printer) {
            this.$store.dispatch('socket/setData', {
                hostname: printer.socket.hostname,
                port: printer.socket.port
            })
            Vue.prototype.$socket.setUrl(this.protocol+"://"+printer.socket.hostname+":"+printer.socket.port+"/websocket")
            Vue.prototype.$socket.connect()
        },
        reconnect() {
            this.$store.dispatch('socket/setData', { connectingFailed: false })
            Vue.prototype.$socket.connect()
        },
        switchToChangePrinter() {
            this.$store.dispatch('socket/setData', { connectingFailed: false })
        },
        checkPrinters() {
            Object.entries(this.printers).forEach(([key, printer]) => {
                if (!printer.socket.isConnected && !printer.socket.isConnecting) {
                    this.$store.dispatch('farm/'+key+'/connect')
                }
            })
        }
    },
    mounted() {
        this.$store.dispatch("farm/readStoredPrinters")
    },
    watch: {
        isConnected(newVal) {
            this.showDialog = !newVal
        },
    }
}
</script>