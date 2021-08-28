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
                    <template v-else-if="Object.keys(this.printers).length > 0"><v-btn small class="minwidth-0" @click="checkPrinters"><v-icon small>mdi-sync</v-icon></v-btn></template>
                </template>
            </v-toolbar>
            <v-card-text class="pt-5" v-if="isConnecting">
                <v-progress-linear color="white" indeterminate></v-progress-linear>
            </v-card-text>
            <v-card-text class="pt-5" v-if="!isConnecting && connectingFailed">
                <p>{{ $t("SelectPrinterDialog.CannotConnectTo", {'host': parseInt(port) !== 80 ? hostname+":"+port : hostname}) }}</p>
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
                            <p class="text-center" v-if="Object.keys(this.printers).length === 0">{{ $t("SelectPrinterDialog.Hello") }}</p>
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

<script lang="ts">


import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from './mixins/base'
import {FarmPrinterState} from '@/store/farm/printer/types'

@Component
export default class TheSelectPrinterDialog extends Mixins(BaseMixin) {

    private dialogAddPrinter = {
        bool: false,
        hostname: '',
        port: 7125
    }
    private dialogEditPrinter = {
        bool: false,
        index: 0,
        hostname: '',
        port: 0
    }

    get printers() {
        return this.$store.getters['farm/getPrinters'] ?? []
    }

    get protocol() {
        return this.$store.state.socket.protocol
    }

    get hostname() {
        return this.$store.state.socket.hostname
    }

    get port() {
        return this.$store.state.socket.port
    }

    get formatHostname() {
        return parseInt(this.port) !== 80 && this.port !== '' ? this.hostname+':'+this.port : this.hostname
    }

    get isConnected() {
        return this.$store.state.socket.isConnected
    }

    get isConnecting() {
        return this.$store.state.socket.isConnecting
    }

    get connectingFailed() {
        return this.$store.state.socket.connectingFailed
    }

    get showDialog() {
        return !this.isConnected
    }

    get currentUrl() {
        let output =  'http://'+window.location.hostname
        if (parseInt(window.location.port) !== 80 && window.location.port !== '') output += ':'+window.location.port

        return output
    }

    get showCorsInfo() {
        if (Object.keys(this.printers).length) {
            Object.keys(this.printers).forEach((key) => {
                const printer = this.printers[key]
                if (!printer.socket.isConnected) return true
            })

            return false
        }

        return true
    }

    getPrinterName(namespace: string) {
        return this.$store.getters['farm/getPrinterName'](namespace)
    }

    addPrinter() {
        this.$store.dispatch('farm/addPrinter',{
            hostname: this.dialogAddPrinter.hostname,
            port: this.dialogAddPrinter.port,
            protocol: this.protocol
        })

        this.dialogAddPrinter.hostname = ''
        this.dialogAddPrinter.bool = false
    }

    editPrinter(index: number) {
        this.dialogEditPrinter.hostname = this.printers[index].socket.hostname
        this.dialogEditPrinter.port = this.printers[index].socket.port
        this.dialogEditPrinter.index = index
        this.dialogEditPrinter.bool = true
    }

    updatePrinter() {
        this.$store.dispatch('farm/updatePrinter', {
            namespace: this.dialogEditPrinter.index,
            hostname: this.dialogEditPrinter.hostname,
            port: this.dialogEditPrinter.port,
        })
        this.dialogEditPrinter.bool = false
    }

    delPrinter() {
        this.$store.dispatch('farm/removePrinter', { name: this.dialogEditPrinter.index })
        this.dialogEditPrinter.bool = false
    }

    connect(printer: FarmPrinterState) {
        this.$store.dispatch('socket/setData', {
            hostname: printer.socket.hostname,
            port: printer.socket.port
        })
        this.$socket.setUrl(this.protocol+'://'+printer.socket.hostname+':'+printer.socket.port+'/websocket')
        this.$socket.connect()
    }

    reconnect() {
        this.$store.dispatch('socket/setData', { connectingFailed: false })
        this.$socket.connect()
    }

    switchToChangePrinter() {
        this.$store.dispatch('socket/setData', { connectingFailed: false })
    }

    checkPrinters() {
        Object.keys(this.printers).forEach((key) => {
            const printer = this.printers[key]
            if (!printer.socket.isConnected && !printer.socket.isConnecting) {
                this.$store.dispatch('farm/'+key+'/connect')
            }
        })
    }

    mounted() {
        this.$store.dispatch('farm/readStoredPrinters')
    }
}
</script>