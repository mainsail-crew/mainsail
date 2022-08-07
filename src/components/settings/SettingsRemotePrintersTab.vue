<template>
    <div>
        <v-card v-if="!form.bool" flat>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.RemotePrintersTab.RemotePrinters') }}</h3>
                <v-alert v-if="!canAddPrinters" :icon="mdiAlertOutline" type="warning" text>
                    {{ $t('Settings.RemotePrintersTab.UseConfigJson') }}
                </v-alert>
                <div v-for="(printer, index) in printers" :key="printer.id">
                    <v-divider v-if="index" class="my-2"></v-divider>
                    <settings-row
                        :title="formatPrinterName(printer)"
                        :loading="printer.socket.isConnecting"
                        :icon="printer.socket.isConnected ? mdiCheckboxMarkedCircle : mdiCancel">
                        <v-btn small outlined :disabled="!canAddPrinters" @click="editPrinter(printer)">
                            <v-icon left small>{{ mdiPencil }}</v-icon>
                            {{ $t('Settings.Edit') }}
                        </v-btn>
                        <v-btn
                            small
                            outlined
                            class="ml-3 minwidth-0 px-2"
                            color="error"
                            :disabled="!canAddPrinters"
                            @click="delPrinter(printer.id)">
                            <v-icon small>{{ mdiDelete }}</v-icon>
                        </v-btn>
                    </settings-row>
                </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text color="primary" :disabled="!canAddPrinters" @click="createPrinter">
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
                        hide-details="auto"
                        required
                        dense
                        outlined></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.RemotePrintersTab.Port')">
                    <v-text-field
                        v-model="form.port"
                        :rules="[(v) => !!v || 'Port is required']"
                        hide-details="auto"
                        required
                        dense
                        outlined></v-text-field>
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="form.bool = false">{{ $t('Settings.Cancel') }}</v-btn>
                <v-btn v-if="form.id === null" text color="primary" @click="storePrinter">
                    {{ $t('Settings.RemotePrintersTab.AddPrinter') }}
                </v-btn>
                <v-btn v-else text color="primary" @click="updatePrinter">
                    {{ $t('Settings.RemotePrintersTab.UpdatePrinter') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { GuiRemoteprintersStatePrinter } from '@/store/gui/remoteprinters/types'
import { mdiCancel, mdiCheckboxMarkedCircle, mdiDelete, mdiPencil, mdiAlertOutline } from '@mdi/js'

interface printerForm {
    bool: boolean
    hostname: string
    port: number
    id: string | null
    namespace: string | null
}

@Component({
    components: { SettingsRow },
})
export default class SettingsRemotePrintersTab extends Mixins(BaseMixin) {
    mdiCheckboxMarkedCircle = mdiCheckboxMarkedCircle
    mdiCancel = mdiCancel
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete
    mdiAlertOutline = mdiAlertOutline

    private form: printerForm = {
        bool: false,
        hostname: '',
        port: 7125,
        id: null,
        namespace: null,
    }

    get printers() {
        return this.$store.getters['gui/remoteprinters/getRemoteprinters'] ?? []
    }

    get canAddPrinters() {
        return this.$store.state.instancesDB !== 'json'
    }

    get protocol() {
        return this.$store.state.socket.protocol ?? 'ws'
    }

    formatPrinterName(printer: GuiRemoteprintersStatePrinter) {
        return printer.hostname + (printer.port !== 80 ? ':' + printer.port : '')
    }

    createPrinter() {
        this.form.hostname = ''
        this.form.port = 7125
        this.form.id = null
        this.form.namespace = null
        this.form.bool = true
    }

    storePrinter() {
        const printer = {
            hostname: this.form.hostname,
            port: this.form.port,
        }

        this.$store.dispatch('gui/remoteprinters/store', { values: printer })

        this.form.hostname = ''
        this.form.port = 7125
        this.form.id = null
        this.form.bool = false
    }

    editPrinter(printer: GuiRemoteprintersStatePrinter) {
        this.form.id = printer.id ?? null
        this.form.hostname = printer.hostname
        this.form.port = printer.port
        this.form.bool = true
    }

    updatePrinter() {
        const values = {
            hostname: this.form.hostname,
            port: this.form.port,
        }

        this.$store.dispatch('gui/remoteprinters/update', { id: this.form.id, values })

        this.form.id = null
        this.form.hostname = ''
        this.form.port = 7125
        this.form.bool = false
    }

    delPrinter(id: string) {
        this.$store.dispatch('gui/remoteprinters/delete', id)
    }
}
</script>
