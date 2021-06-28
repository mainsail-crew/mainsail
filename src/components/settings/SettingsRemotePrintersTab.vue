
<template>
    <div>
        <v-card flat v-if="!form.bool">
            <v-card-text>
                <div v-for="(printer, name, index) in printers" v-bind:key="name">
                    <v-divider class="my-2" v-if="index"></v-divider>
                    <settings-row
                        :title="formatPrinterName(printer)"
                        :loading="printer.socket.isConnecting"
                        :icon="printer.socket.isConnected ? 'mdi-checkbox-marked-circle' : 'mdi-cancel'"
                    >
                        <v-btn small outlined @click="editPrinter(printer, name)">
                            <v-icon left small>mdi-pencil</v-icon>{{ $t('Settings.Edit') }}
                        </v-btn>
                        <v-btn small outlined @click="delPrinter(name)" class="ml-3 minwidth-0 px-2" color="error">
                            <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                    </settings-row>
                </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text color="primary" @click="createPrinter">{{ $t("Settings.RemotePrintersTab.AddPrinter")}}</v-btn>
            </v-card-actions>
        </v-card>
        <v-card flat v-else>
            <v-card-title>
                {{ form.namespace ? $t('Settings.RemotePrintersTab.EditPrinter') : $t('Settings.RemotePrintersTab.AddPrinter') }}
            </v-card-title>
            <v-card-text>
                <settings-row :title="$t('Settings.RemotePrintersTab.Hostname')">
                    <v-text-field
                        v-model="form.hostname"
                        :rules="[
                            v => !!v || 'Hostname is required',
                            v => !v.startsWith('http:') || 'invalid hostname/IP',
                            v => !v.startsWith('https:') || 'invalid hostname/IP',
                        ]"
                        hide-details="auto"
                        required
                        dense
                        outlined
                    ></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.RemotePrintersTab.Port')">
                    <v-text-field
                        v-model="form.port"
                        :rules="[v => !!v || 'Port is required']"
                        hide-details="auto"
                        required
                        dense
                        outlined
                    ></v-text-field>
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="form.bool = false">{{ $t("Settings.Cancel")}}</v-btn>
                <v-btn text color="primary" @click="storePrinter" v-if="form.namespace === null">{{ $t("Settings.RemotePrintersTab.AddPrinter")}}</v-btn>
                <v-btn text color="primary" @click="updatePrinter" v-else>{{ $t("Settings.RemotePrintersTab.UpdatePrinter")}}</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">


import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "../mixins/base";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import {FarmPrinterState} from "@/store/farm/printer/types";

interface printerForm {
    bool: boolean
    hostname: string
    port: number
    namespace: string | null
}

@Component({
    components: {SettingsRow}
})
export default class SettingsRemotePrintersTab extends Mixins(BaseMixin) {
    private form: printerForm = {
        bool: false,
        hostname: "",
        port: 7125,
        namespace: null
    }

    get printers() {
        return this.$store.getters['farm/getPrinters'] ?? []
    }

    get protocol() {
        return this.$store.state.socket.protocol ?? 'ws'
    }

    formatPrinterName(printer: FarmPrinterState) {
        return printer.socket.hostname+(printer.socket.port !== 80 ? ":"+printer.socket.port : "")
    }

    createPrinter() {
        this.form.hostname = ""
        this.form.port = 7125
        this.form.namespace = null
        this.form.bool = true
    }

    storePrinter() {
        this.$store.dispatch('farm/addPrinter',{
            hostname: this.form.hostname,
            port: this.form.port,
            protocol: this.protocol
        })

        this.form.hostname = ""
        this.form.port = 7125
        this.form.namespace = null
        this.form.bool = false
    }

    editPrinter(printer: FarmPrinterState, namespace: string) {
        this.form.hostname = printer.socket.hostname
        this.form.port = printer.socket.port
        this.form.namespace = namespace
        this.form.bool = true
    }

    updatePrinter() {
        this.$store.dispatch("farm/updatePrinter", {
            namespace: this.form.namespace,
            hostname: this.form.hostname,
            port: this.form.port,
        })

        this.form.hostname = ""
        this.form.port = 7125
        this.form.namespace = null
        this.form.bool = false
    }

    delPrinter(namespace: string) {
        this.$store.dispatch("farm/removePrinter", { name: namespace })
    }
}
</script>