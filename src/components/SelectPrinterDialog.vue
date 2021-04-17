<style scoped>

</style>

<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <v-card dark>
            <v-toolbar flat dense color="primary">
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-connection" left></v-icon>
                        <span v-if="isConnecting">{{ $t("App.ConnectionTo") }}{{ parseInt(port) !== 80 ? hostname+':'+port : hostname }}</span>
                        <span v-if="connectingFailed">{{ $t("App.ConnectionFailed") }}</span>
                        <span v-if="!isConnecting && !connectingFailed && !dialogAddPrinter.bool && !dialogEditPrinter.bool">{{ $t("App.SelectPrinter") }}</span>
                        <span v-if="dialogAddPrinter.bool">{{ $t("App.AddPrinter") }}</span>
                        <span v-if="dialogEditPrinter.bool">{{ $t("App.EditPrinter") }}</span>
                    </span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn v-if="!isConnecting && !connectingFailed && !dialogAddPrinter.bool && !dialogEditPrinter.bool && countPrinters > 0" small class="minwidth-0" @click="checkPrinters"><v-icon small>mdi-sync</v-icon></v-btn>
                <v-btn small class="minwidth-0" v-if="!isConnecting && !connectingFailed && dialogAddPrinter.bool" @click="dialogAddPrinter.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                <v-btn small class="minwidth-0" v-if="!isConnecting && !connectingFailed && dialogEditPrinter.bool" @click="dialogEditPrinter.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
            </v-toolbar>
            <v-card-text class="pt-5" v-if="isConnecting">
                <v-progress-linear color="white" indeterminate></v-progress-linear>
            </v-card-text>
            <v-card-text class="pt-5" v-if="!isConnecting && connectingFailed">
                <p>{{ $t("App.CannotNotConnectTo") }} {{ parseInt(port) !== 80 ? hostname+":"+port : hostname }}.</p>
                <div class="text-center">
                    <v-btn @click="switchToChangePrinter" color="white" outlined class="mr-3">{{ $t("App.ChangePrinter") }}</v-btn>
                    <v-btn @click="reconnect" color="primary">{{ $t("App.TryAgain") }}</v-btn>
                </div>
            </v-card-text>
            <v-card-text class="pt-3" v-if="!isConnecting && dialogAddPrinter.bool">
                <v-container class="px-0 py-0">
                    <v-row>
                        <v-col class="col-8">
                            <v-text-field
                                v-model="dialogAddPrinter.hostname"
                                :rules="[
                                    v => !!v || 'Hostname is required',
                                    v => !v.startsWith('http:') || 'invalid hostname/IP',
                                    v => !v.startsWith('https:') || 'invalid hostname/IP',
                                ]"
                                label="Hostname/IP"
                                required
                            ></v-text-field>
                        </v-col>
                        <v-col class="col-4">
                            <v-text-field
                                v-model="dialogAddPrinter.port"
                                :rules="[v => !!v || 'Port is required']"
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
                                {{ $t("App.AddPrinter") }}
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
                                    v => !!v || 'Hostname is required',
                                    v => !v.startsWith('http:') || 'invalid hostname/IP',
                                    v => !v.startsWith('https:') || 'invalid hostname/IP',
                                ]"
                                label="Hostname/IP"
                                required
                            ></v-text-field>
                        </v-col>
                        <v-col class="col-4">
                            <v-text-field
                                v-model="dialogEditPrinter.port"
                                :rules="[v => !!v || 'Port is required']"
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
                                {{ $t("App.UpdatePrinter") }}
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
                            <p class="text-center" v-if="countPrinters === 0">{{ $t("App.Hello") }}</p>
                            <p class="text-center">{{ $t("App.PleaseRememberToAdd") }}<code>{{ currentUrl }}</code> {{ $t("App.InMoonrakerConf") }}</p>
                            <p class="text-center mb-0">{{ $t("App.YouCanFindMore") }} <a :href="$t('App.Remotemode')" target="_blank">{{ $t("App.Remotemode") }}</a>.</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center mt-0">
                            <v-btn @click="dialogAddPrinter.bool = true">{{ $t("App.AddPrinter") }}</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import Vue from "vue";

export default {
    data: function() {
        return {
            showDialog: true,
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
        ...mapState({
            isConnected: state => state.socket.isConnected,
            isConnecting: state => state.socket.isConnecting,
            connectingFailed: state => state.socket.connectingFailed,
            remoteMode: state => state.socket.remoteMode,
            protocol: state => state.socket.protocol,
            hostname: state => state.socket.hostname,
            port: state => state.socket.port,
        }),
        ...mapGetters({
            countPrinters: "farm/countPrinters",
            printers: "farm/getPrinters",
            getPrinterName: "farm/getPrinterName",
        }),
        ...mapActions({
            readPrinters: "farm/readStoredPrinters"
        }),
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