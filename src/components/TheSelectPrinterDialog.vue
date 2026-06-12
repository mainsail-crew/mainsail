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
                        <v-btn :icon="mdiCloseThick" tile class="minwidth-0" @click="dialogEditPrinter.bool = false" />
                    </template>
                    <template v-else-if="dialogAddPrinter.bool">
                        <v-btn
                            v-if="dialogAddPrinter.bool"
                            :icon="mdiCloseThick"
                            tile
                            class="minwidth-0"
                            @click="dialogAddPrinter.bool = false" />
                    </template>
                    <template v-else-if="printers.length > 0">
                        <v-btn :icon="mdiSync" tile class="minwidth-0" color="primary" @click="checkPrinters" />
                    </template>
                </template>
            </template>
            <template v-if="isConnecting || (isConnected && !guiIsReady)">
                <v-card-text>
                    <v-progress-linear color="primary" indeterminate />
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
                        <v-btn variant="text" color="white" class="mr-3" @click="switchToChangePrinter">
                            {{ $t('SelectPrinterDialog.ChangePrinter') }}
                        </v-btn>
                        <v-btn variant="text" color="primary" @click="reconnect">{{ $t('SelectPrinterDialog.TryAgain') }}</v-btn>
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
                                    dense />
                            </v-col>
                            <v-col class="col-4">
                                <v-text-field
                                    v-model="dialogAddPrinter.port"
                                    :rules="[(v) => !!v || $t('SelectPrinterDialog.PortRequired')]"
                                    :label="$t('SelectPrinterDialog.Port')"
                                    hide-details="auto"
                                    required
                                    outlined
                                    dense />
                            </v-col>
                        </v-row>
                        <v-row v-if="showOptionalSettings">
                            <v-col :cols="6">
                                <v-text-field
                                    v-model="dialogAddPrinter.path"
                                    :rules="[(v) => !v || v.startsWith('/') || 'Path must start with /']"
                                    :label="$t('SelectPrinterDialog.Path')"
                                    hide-details="auto"
                                    outlined
                                    dense />
                            </v-col>
                            <v-col :cols="6">
                                <v-text-field
                                    v-model="dialogAddPrinter.name"
                                    :label="$t('SelectPrinterDialog.Name')"
                                    outlined
                                    hide-details="auto"
                                    dense />
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-checkbox
                            v-model="showOptionalSettings"
                            class="ml-2"
                            :on-icon="mdiShowOptional"
                            :off-icon="mdiHideOptional"
                            :true-value="false"
                            :false-value="true" />
                        <v-spacer />
                        <v-btn color="primary" variant="text" class="middle" type="submit" :disabled="!addPrinterValid">
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
                                    hide-details="auto" />
                            </v-col>
                            <v-col class="col-4">
                                <v-text-field
                                    v-model="dialogEditPrinter.port"
                                    :rules="[(v) => !!v || $t('SelectPrinterDialog.PortRequired')]"
                                    :label="$t('SelectPrinterDialog.Port')"
                                    required
                                    outlined
                                    dense
                                    hide-details="auto" />
                            </v-col>
                        </v-row>
                        <v-row v-if="showOptionalSettings">
                            <v-col :cols="6">
                                <v-text-field
                                    v-model="dialogEditPrinter.path"
                                    :rules="[(v) => !v || v.startsWith('/') || 'Path must start with /']"
                                    :label="$t('SelectPrinterDialog.Path')"
                                    hide-details="auto"
                                    outlined
                                    dense />
                            </v-col>
                            <v-col :cols="6">
                                <v-text-field
                                    v-model="dialogEditPrinter.name"
                                    :label="$t('SelectPrinterDialog.Name')"
                                    outlined
                                    hide-details="auto"
                                    dense />
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="red" :icon="mdiDelete" tile class="minwidth-0 rounded" @click="delPrinter" />
                        <v-checkbox
                            v-model="showOptionalSettings"
                            class="ml-2"
                            :on-icon="mdiShowOptional"
                            :off-icon="mdiHideOptional"
                            :true-value="false"
                            :false-value="true" />
                        <v-spacer />
                        <v-btn color="primary" variant="text" type="submit" :disabled="!editPrinterValid">
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
                                                width="2.5" />
                                            <v-icon
                                                v-if="!printer.socket.isConnecting"
                                                :color="printer.socket.isConnected ? 'green' : 'red'">
                                                {{ printer.socket.isConnected ? mdiCheckboxMarkedCircle : mdiCancel }}
                                            </v-icon>
                                        </v-col>
                                        <v-col>{{ getPrinterName(printer.id) }}</v-col>
                                        <v-col v-if="canAddPrinters" class="col-auto pa-0">
                                            <v-btn tile large :icon="mdiPencil" class="mr-1" @click.stop.prevent="editPrinter(printer)" />
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
                                <v-btn variant="text" color="primary" @click="createPrinter">
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useSocket } from '@/composables/useSocket'
import { FarmPrinterState } from '@/store/farm/printer/types'
import Panel from '@/components/ui/Panel.vue'
import { GuiRemoteprintersStatePrinter } from '@/store/gui/remoteprinters/types'
import {
    mdiCancel,
    mdiCheckboxMarkedCircle,
    mdiCloseThick,
    mdiCog,
    mdiCogOff,
    mdiConnection,
    mdiDelete,
    mdiPencil,
    mdiSync,
} from '@mdi/js'

const store = useStore()
const route = useRoute()
const { t } = useI18n()
const { guiIsReady, instancesDB } = useBase()
const socket = useSocket()

const addPrinterValid = ref(false)
const dialogAddPrinter = ref({
    bool: false,
    hostname: '',
    port: 7125,
    path: '/',
    name: '',
})
const editPrinterValid = ref(false)
const dialogEditPrinter = ref({
    bool: false,
    id: '',
    hostname: '',
    port: 0,
    path: '/',
    name: '',
})
const showOptionalSettings = ref(false)

const mdiShowOptional = mdiCog
const mdiHideOptional = mdiCogOff

const printers = computed(() => store.getters['gui/remoteprinters/getRemoteprinters'] ?? [])

const canAddPrinters = computed(() => instancesDB.value !== 'json')

const protocol = computed(() => store.state.socket.protocol)
const defaultMoonrakerPort = computed(() => protocol.value === 'wss' ? 7130 : 7125)
const hostname = computed(() => store.state.socket.hostname)
const port = computed(() => store.state.socket.port)
const path = computed(() => store.state.socket.path)
const name = computed(() => store.state.printer)
const formatHostname = computed(() => hostname.value + (port.value !== '' ? ':' + port.value : '') + (path.value !== '' ? path.value : ''))
const isConnected = computed(() => store.state.socket.isConnected)
const isConnecting = computed(() => store.state.socket.isConnecting)
const connectingFailed = computed(() => store.state.socket.connectingFailed)
const showDialog = computed(() => !isConnected.value || (isConnected.value && !guiIsReady.value))
const currentUrl = computed(() => {
    let output = document.location.protocol + '//' + window.location.hostname
    if (parseInt(window.location.port) !== 80 && window.location.port !== '') output += ':' + window.location.port
    return output
})

const showCorsInfo = computed(() => {
    if (printers.value.length) {
        printers.value.forEach((printer: GuiRemoteprintersStatePrinter) => {
            if (printer && !printer.socket?.isConnected) return true
        })
        return false
    }
    return true
})

const panelTitle = computed(() => {
    if (dialogAddPrinter.value.bool) return t('SelectPrinterDialog.AddPrinter')
    else if (dialogEditPrinter.value.bool) return t('SelectPrinterDialog.EditPrinter')
    else if (isConnecting.value) return t('SelectPrinterDialog.Connecting', { host: formatHostname.value })
    else if (isConnected.value && !guiIsReady.value) return t('ConnectionDialog.Initializing')
    else if (connectingFailed.value) return t('SelectPrinterDialog.ConnectionFailed', { host: formatHostname.value })
    else return t('SelectPrinterDialog.SelectPrinter')
})

function getPrinterName(namespace: string) {
    return store.getters['farm/getPrinterName'](namespace)
}

function createPrinter() {
    dialogAddPrinter.value.hostname = ''
    dialogAddPrinter.value.port = defaultMoonrakerPort.value
    dialogAddPrinter.value.bool = true
}

function addPrinter() {
    const values = {
        hostname: dialogAddPrinter.value.hostname,
        port: dialogAddPrinter.value.port,
        path: dialogAddPrinter.value.path,
        name: dialogAddPrinter.value.name,
    }
    store.dispatch('gui/remoteprinters/store', { values })
    dialogAddPrinter.value.hostname = ''
    dialogAddPrinter.value.bool = false
    dialogAddPrinter.value.path = '/'
    dialogAddPrinter.value.name = ''
}

function editPrinter(printer: GuiRemoteprintersStatePrinter) {
    dialogEditPrinter.value.hostname = printer.hostname
    dialogEditPrinter.value.port = printer.port
    dialogEditPrinter.value.id = printer.id ?? ''
    dialogEditPrinter.value.path = printer.path ?? '/'
    dialogEditPrinter.value.name = printer.name ?? ''
    dialogEditPrinter.value.bool = true
    showOptionalSettings.value = printer.name ? printer.name.length > 0 : false
}

function updatePrinter() {
    const values = {
        hostname: dialogEditPrinter.value.hostname,
        port: dialogEditPrinter.value.port,
        path: dialogEditPrinter.value.path,
        id: dialogEditPrinter.value.id,
        name: dialogEditPrinter.value.name,
    }
    store.dispatch('gui/remoteprinters/update', {
        id: dialogEditPrinter.value.id,
        values,
    })
    dialogEditPrinter.value.bool = false
}

function delPrinter() {
    store.dispatch('gui/remoteprinters/delete', dialogEditPrinter.value.id)
    dialogEditPrinter.value.bool = false
}

function connect(printer: FarmPrinterState) {
    store.dispatch('socket/setData', {
        hostname: printer.socket.hostname,
        port: printer.socket.port,
        path: printer.socket.path,
    })
    const normPath = printer.socket.path.replaceAll(/(^\/*)|(\/*$)/g, '')
    const url =
        protocol.value +
        '://' +
        printer.socket.hostname +
        ':' +
        printer.socket.port +
        (normPath.length > 0 ? `/${normPath}` : '') +
        '/websocket'
    socket.setUrl(url)
    socket.connect()
}

function reconnect() {
    store.dispatch('socket/setData', { connectingFailed: false })
    socket.connect()
}

function switchToChangePrinter() {
    store.dispatch('socket/setData', { connectingFailed: false })
}

function checkPrinters() {
    printers.value.forEach((printer: GuiRemoteprintersStatePrinter) => {
        if (printer && !printer.socket?.isConnected && !printer.socket?.isConnecting) {
            store.dispatch('farm/' + printer.id + '/connect')
        }
    })
}

onMounted(() => {
    store.dispatch('gui/remoteprinters/initFromLocalstorage').then(() => {
        if (!('printer' in route.query)) return

        const printerQuery = route.query.printer
        if (printerQuery === null || printerQuery === undefined) return
        const name = printerQuery.toString().toLowerCase()
        const matching = printers.value.filter(
            (printer: GuiRemoteprintersStatePrinter) => printer.name?.toLowerCase() === name
        )

        if (matching.length == 0) {
            window.console.error(`No printer with given name '${name}' found. Showing selection dialog instead.`)
            return
        }

        if (matching.length > 1) {
            window.console.error(`Multiple printers with name '${name}' found. Showing selection dialog instead.`)
            return
        }

        connect(matching[0])
    })
})
</script>
