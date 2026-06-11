<template>
    <div>
        <v-card v-if="!form.bool" flat>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.RemotePrintersTab.RemotePrinters') }}</h3>
                <v-alert v-if="!canAddPrinters" :icon="mdiAlertOutline" type="warning" text>
                    {{ $t('Settings.RemotePrintersTab.UseConfigJson') }}
                </v-alert>
                <div v-for="(printer, index) in printers" :key="printer.id">
                    <v-divider v-if="index" class="my-2" />
                    <settings-row
                        :title="formatPrinterName(printer)"
                        :loading="printer.socket.isConnecting"
                        :icon="printer.socket.isConnected ? mdiCheckboxMarkedCircle : mdiCancel">
                        <v-btn small variant="outlined" :disabled="!canAddPrinters" @click="editPrinter(printer)">
                            <v-icon left small>{{ mdiPencil }}</v-icon>
                            {{ $t('Settings.Edit') }}
                        </v-btn>
                        <v-btn
                            small variant="outlined" class="ml-3 minwidth-0 px-2"
                            color="error"
                            :disabled="!canAddPrinters"
                            @click="delPrinter(printer.id)">
                            <v-icon small>{{ mdiDelete }}</v-icon>
                        </v-btn>
                    </settings-row>
                </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="text" color="primary" :disabled="!canAddPrinters" @click="createPrinter">
                    {{ $t('Settings.RemotePrintersTab.AddPrinter') }}
                </v-btn>
            </v-card-actions>
        </v-card>
        <v-card v-else flat>
            <v-card-title>
                {{
                    form.id !== null
                        ? $t('Settings.RemotePrintersTab.EditPrinter')
                        : $t('Settings.RemotePrintersTab.AddPrinter')
                }}
            </v-card-title>
            <v-card-text>
                <settings-row :title="$t('Settings.RemotePrintersTab.Hostname')">
                    <v-text-field
                        v-model="form.hostname"
                        :rules="[
                            (v) => !!v || 'Hostname is required',
                            (v) => !v.startsWith('http:') || 'invalid hostname/IP',
                            (v) => !v.startsWith('https:') || 'invalid hostname/IP',
                        ]"
                        hide-details
                        required
                        dense
                        outlined />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.RemotePrintersTab.Port')">
                    <v-text-field
                        v-model="form.port"
                        :rules="[(v) => !!v || 'Port is required']"
                        hide-details
                        required
                        dense
                        outlined />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.RemotePrintersTab.Path')">
                    <v-text-field
                        v-model="form.path"
                        :rules="[(v) => !v || v.startsWith('/') || 'Path must start with /']"
                        hide-details
                        outlined
                        dense />
                </settings-row>
                <template v-if="instancesDB !== 'moonraker'">
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.RemotePrintersTab.Name')"
                        :sub-title="$t('Settings.RemotePrintersTab.NameDescription')">
                        <v-text-field v-model="form.name" outlined hide-details dense />
                    </settings-row>
                </template>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="text" @click="form.bool = false">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn v-if="form.id === null" variant="text" color="primary" @click="storePrinter">
                    {{ $t('Settings.RemotePrintersTab.AddPrinter') }}
                </v-btn>
                <v-btn v-else variant="text" color="primary" @click="updatePrinter">
                    {{ $t('Settings.RemotePrintersTab.UpdatePrinter') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import type { GuiRemoteprintersStatePrinter } from '@/store/gui/remoteprinters/types'
import { mdiCancel, mdiCheckboxMarkedCircle, mdiDelete, mdiPencil, mdiAlertOutline } from '@mdi/js'

interface printerForm {
    bool: boolean
    hostname: string
    name: string
    port: number
    path: string | null
    id: string | null
    namespace: string | null
}

const store = useStore()
const { instancesDB } = useBase()

const form = reactive<printerForm>({
    bool: false,
    hostname: '',
    port: 7125,
    path: '/',
    name: '',
    id: null,
    namespace: null,
})

const printers = computed(() => store.getters['gui/remoteprinters/getRemoteprinters'] ?? [])

const canAddPrinters = computed(() => store.state.instancesDB !== 'json')

const protocol = computed(() => store.state.socket.protocol ?? 'ws')

function formatPrinterName(printer: GuiRemoteprintersStatePrinter) {
    return printer.hostname + (printer.port !== 80 ? ':' + printer.port : '') + (printer.path ?? '')
}

function createPrinter() {
    form.hostname = ''
    form.port = 7125
    form.path = '/'
    form.name = ''
    form.id = null
    form.namespace = null
    form.bool = true
}

function storePrinter() {
    const printer = {
        hostname: form.hostname,
        port: form.port,
        name: form.name,
        path: form.path,
    }

    store.dispatch('gui/remoteprinters/store', { values: printer })

    form.hostname = ''
    form.port = 7125
    form.name = ''
    form.id = null
    form.bool = false
}

function editPrinter(printer: GuiRemoteprintersStatePrinter) {
    form.id = printer.id ?? null
    form.hostname = printer.hostname
    form.port = printer.port
    form.path = printer.path ?? '/'
    form.name = printer.name ?? ''
    form.bool = true
}

function updatePrinter() {
    const values = {
        hostname: form.hostname,
        port: form.port,
        name: form.name,
        path: form.path,
    }

    store.dispatch('gui/remoteprinters/update', { id: form.id, values })

    form.id = null
    form.hostname = ''
    form.port = 7125
    form.path = '/'
    form.name = ''
    form.bool = false
}

function delPrinter(id: string) {
    store.dispatch('gui/remoteprinters/delete', id)
}
</script>
