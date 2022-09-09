<style scoped></style>

<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <panel
            card-class="select-printer-dialog"
            :icon="mdiConnection"
            :title="panelTitle"
            :margin-bottom="false"
            toolbar-color="toolbar">
            <template #buttons>
                <template v-if="!isConnecting && !connectingFailed">
                    <template v-if="dialogEditPrinter.bool">
                        <v-btn icon tile class="minwidth-0" @click="dialogEditPrinter.bool = false">
                            <v-icon>{{ mdiCloseThick }}</v-icon>
                        </v-btn>
                    </template>
                    <template v-else-if="dialogAddPrinter.bool">
                        <v-btn
                            v-if="dialogAddPrinter.bool"
                            icon
                            tile
                            class="minwidth-0"
                            @click="dialogAddPrinter.bool = false">
                            <v-icon>{{ mdiCloseThick }}</v-icon>
                        </v-btn>
                    </template>
                    <template v-else-if="printers.length > 0">
                        <v-btn icon tile class="minwidth-0" color="primary" @click="checkPrinters">
                            <v-icon>{{ mdiSync }}</v-icon>
                        </v-btn>
                    </template>
                </template>
            </template>
            <template v-if="isConnecting || (isConnected && !guiIsReady)">
                <v-card-text>
                    <v-progress-linear color="primary" indeterminate></v-progress-linear>
                </v-card-text>
            </template>
            <template v-else-if="connectingFailed">
                <v-card-text>
                    <p>
                        {{
                            $t('SelectPrinterDialog.CannotConnectTo', {
                                host: parseInt(port) !== 80 ? hostname + ':' + port : hostname,
                            })
                        }}
                    </p>
                    <div class="text-center">
                        <v-btn text color="white" class="mr-3" @click="switchToChangePrinter">
                            {{ $t('SelectPrinterDialog.ChangePrinter') }}
                        </v-btn>
                        <v-btn text color="primary" @click="reconnect">{{ $t('SelectPrinterDialog.TryAgain') }}</v-btn>
                    </div>
                </v-card-text>
            </template>
            <template v-else-if="dialogAddPrinter.bool">
                <v-form v-model="addPrinterValid" @submit.prevent="addPrinter">
                    <v-card-text>
                        <v-row>
                            <v-col class="col-8">
                                <v-text-field
                                    v-model="dialogAddPrinter.hostname"
                                    :rules="[
                                        (v) => !!v || $t('SelectPrinterDialog.HostnameRequired'),
                                        (v) => !v.startsWith('http:') || $t('SelectPrinterDialog.HostnameInvalid'),
                                        (v) => !v.startsWith('https:') || $t('SelectPrinterDialog.HostnameInvalid'),
                                    ]"
                                    :label="$t('SelectPrinterDialog.HostnameIp')"
                                    required
                                    outlined
                                    hide-details="auto"
                                    dense></v-text-field>
                            </v-col>
                            <v-col class="col-4">
                                <v-text-field
                                    v-model="dialogAddPrinter.port"
                                    :rules="[(v) => !!v || $t('SelectPrinterDialog.PortRequired')]"
                                    :label="$t('SelectPrinterDialog.Port')"
                                    hide-details="auto"
                                    required
                                    outlined
                                    dense></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text class="middle" type="submit" :disabled="!addPrinterValid">
                            {{ $t('SelectPrinterDialog.AddPrinter') }}
                        </v-btn>
                    </v-card-actions>
                </v-form>
            </template>
            <template v-else-if="dialogEditPrinter.bool">
                <v-form v-model="editPrinterValid" @submit.prevent="updatePrinter">
                    <v-card-text>
                        <v-row>
                            <v-col class="col-8">
                                <v-text-field
                                    v-model="dialogEditPrinter.hostname"
                                    :rules="[
                                        (v) => !!v || $t('SelectPrinterDialog.HostnameRequired'),
                                        (v) => !v.startsWith('http:') || $t('SelectPrinterDialog.HostnameInvalid'),
                                        (v) => !v.startsWith('https:') || $t('SelectPrinterDialog.HostnameInvalid'),
                                    ]"
                                    :label="$t('SelectPrinterDialog.HostnameIp')"
                                    required
                                    outlined
                                    dense
                                    hide-details="auto"></v-text-field>
                            </v-col>
                            <v-col class="col-4">
                                <v-text-field
                                    v-model="dialogEditPrinter.port"
                                    :rules="[(v) => !!v || $t('SelectPrinterDialog.PortRequired')]"
                                    :label="$t('SelectPrinterDialog.Port')"
                                    required
                                    outlined
                                    dense
                                    hide-details="auto"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="red" icon tile class="minwidth-0 rounded" @click="delPrinter">
                            <v-icon small>{{ mdiDelete }}</v-icon>
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text type="submit" :disabled="!editPrinterValid">
                            {{ $t('SelectPrinterDialog.UpdatePrinter') }}
                        </v-btn>
                    </v-card-actions>
                </v-form>
            </template>
            <template v-else>
                <v-card-text class="mt-3">
                    <v-row v-if="printers.length">
                        <v-col class="px-6">
                            <v-row v-for="(printer, index) in printers" :key="index">
                                <v-col
                                    class="rounded transition-swing toolbar py-2 px-2 mb-2 overflow-hidden"
                                    style="cursor: pointer"
                                    @click="connect(printer)">
                                    <v-row align="center">
                                        <v-col class="col-auto pr-0">
                                            <v-progress-circular
                                                v-if="printer.socket.isConnecting"
                                                indeterminate
                                                color="primary"
                                                size="24"
                                                width="2.5"></v-progress-circular>
                                            <v-icon
                                                v-if="!printer.socket.isConnecting"
                                                :color="printer.socket.isConnected ? 'green' : 'red'">
                                                {{ printer.socket.isConnected ? mdiCheckboxMarkedCircle : mdiCancel }}
                                            </v-icon>
                                        </v-col>
                                        <v-col>{{ getPrinterName(printer.id) }}</v-col>
                                        <v-col v-if="canAddPrinters" class="col-auto pa-0">
                                            <v-btn
                                                tile
                                                text
                                                icon
                                                large
                                                class="mr-1"
                                                @click.stop.prevent="editPrinter(printer)">
                                                <v-icon small>{{ mdiPencil }}</v-icon>
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <template v-if="instancesDB === 'browser'">
                        <v-row v-if="showCorsInfo">
                            <v-col>
                                <p v-if="printers.length === 0" class="text-center">
                                    {{ $t('SelectPrinterDialog.Hello') }}
                                </p>
                                <p class="text-center">
                                    {{ $t('SelectPrinterDialog.RememberToAdd', { cors: currentUrl }) }}
                                </p>
                                <p class="text-center mb-0">
                                    {{ $t('SelectPrinterDialog.YouCanFindMore') }}
                                    <br />
                                    <a href="https://docs.mainsail.xyz/remotemode" target="_blank">
                                        https://docs.mainsail.xyz/remotemode
                                    </a>
                                    .
                                </p>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="text-center mt-0">
                                <v-btn text color="primary" @click="createPrinter">
                                    {{ $t('SelectPrinterDialog.AddPrinter') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </template>
                    <v-row v-else-if="instancesDB === 'json' && printers.length === 0">
                        <v-col class="text-center mt-0">
                            <p class="text-center">
                                {{ $t('SelectPrinterDialog.AddPrintersToJson') }}
                            </p>
                        </v-col>
                    </v-row>
                </v-card-text>
            </template>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from './mixins/base'
import { FarmPrinterState } from '@/store/farm/printer/types'
import Panel from '@/components/ui/Panel.vue'
import { GuiRemoteprintersStatePrinter } from '@/store/gui/remoteprinters/types'
import {
    mdiCancel,
    mdiCheckboxMarkedCircle,
    mdiCloseThick,
    mdiConnection,
    mdiDelete,
    mdiPencil,
    mdiSync,
} from '@mdi/js'

@Component({
    components: { Panel },
})
export default class TheSelectPrinterDialog extends Mixins(BaseMixin) {
    private addPrinterValid = false
    private dialogAddPrinter = {
        bool: false,
        hostname: '',
        port: 7125,
    }
    private editPrinterValid = false
    private dialogEditPrinter = {
        bool: false,
        id: '',
        hostname: '',
        port: 0,
    }

    /**
     * Icons
     */
    mdiConnection = mdiConnection
    mdiCloseThick = mdiCloseThick
    mdiSync = mdiSync
    mdiDelete = mdiDelete
    mdiPencil = mdiPencil
    mdiCheckboxMarkedCircle = mdiCheckboxMarkedCircle
    mdiCancel = mdiCancel

    get printers() {
        return this.$store.getters['gui/remoteprinters/getRemoteprinters'] ?? []
    }

    get canAddPrinters() {
        return this.instancesDB !== 'json'
    }

    get protocol() {
        return this.$store.state.socket.protocol
    }

    get defaultMoonrakerPort() {
        return this.protocol === 'wss' ? 7130 : 7125
    }

    get hostname() {
        return this.$store.state.socket.hostname
    }

    get port() {
        return this.$store.state.socket.port
    }

    get formatHostname() {
        return parseInt(this.port) !== 80 && this.port !== '' ? this.hostname + ':' + this.port : this.hostname
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
        return !this.isConnected || (this.isConnected && !this.guiIsReady)
    }

    get currentUrl() {
        let output = document.location.protocol + '//' + window.location.hostname
        if (parseInt(window.location.port) !== 80 && window.location.port !== '') output += ':' + window.location.port

        return output
    }

    get showCorsInfo() {
        if (this.printers.length) {
            this.printers.forEach((printer: GuiRemoteprintersStatePrinter) => {
                if (printer && !printer.socket?.isConnected) return true
            })

            return false
        }

        return true
    }

    get panelTitle() {
        if (this.dialogAddPrinter.bool) return this.$t('SelectPrinterDialog.AddPrinter')
        else if (this.dialogEditPrinter.bool) return this.$t('SelectPrinterDialog.EditPrinter')
        else if (this.isConnecting) return this.$t('SelectPrinterDialog.Connecting', { host: this.formatHostname })
        else if (this.isConnected && !this.guiIsReady) return this.$t('ConnectionDialog.Initializing')
        else if (this.connectingFailed)
            return this.$t('SelectPrinterDialog.ConnectionFailed', { host: this.formatHostname })
        else return this.$t('SelectPrinterDialog.SelectPrinter')
    }

    getPrinterName(namespace: string) {
        return this.$store.getters['farm/getPrinterName'](namespace)
    }

    createPrinter() {
        this.dialogAddPrinter.hostname = ''
        this.dialogAddPrinter.port = this.defaultMoonrakerPort
        this.dialogAddPrinter.bool = true
    }

    addPrinter() {
        const values = {
            hostname: this.dialogAddPrinter.hostname,
            port: this.dialogAddPrinter.port,
        }
        this.$store.dispatch('gui/remoteprinters/store', { values })

        this.dialogAddPrinter.hostname = ''
        this.dialogAddPrinter.bool = false
    }

    editPrinter(printer: GuiRemoteprintersStatePrinter) {
        this.dialogEditPrinter.hostname = printer.hostname
        this.dialogEditPrinter.port = printer.port
        this.dialogEditPrinter.id = printer.id ?? ''
        this.dialogEditPrinter.bool = true
    }

    updatePrinter() {
        const values = {
            hostname: this.dialogEditPrinter.hostname,
            port: this.dialogEditPrinter.port,
        }
        this.$store.dispatch('gui/remoteprinters/update', {
            id: this.dialogEditPrinter.id,
            values,
        })

        this.dialogEditPrinter.bool = false
    }

    delPrinter() {
        this.$store.dispatch('gui/remoteprinters/delete', this.dialogEditPrinter.id)
        this.dialogEditPrinter.bool = false
    }

    connect(printer: FarmPrinterState) {
        this.$store.dispatch('socket/setData', {
            hostname: printer.socket.hostname,
            port: printer.socket.port,
        })
        this.$socket.setUrl(this.protocol + '://' + printer.socket.hostname + ':' + printer.socket.port + '/websocket')
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
        this.printers.forEach((printer: GuiRemoteprintersStatePrinter) => {
            if (printer && !printer.socket?.isConnected && !printer.socket?.isConnecting) {
                this.$store.dispatch('farm/' + printer.id + '/connect')
            }
        })
    }

    mounted() {
        this.$store.dispatch('gui/remoteprinters/initFromLocalstorage')
    }
}
</script>
