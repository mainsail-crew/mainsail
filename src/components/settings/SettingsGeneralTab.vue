<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.GeneralTab.PrinterName').toString()">
                    <v-text-field v-model="printerName" hide-details outlined dense></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.Language').toString()">
                    <v-select
                        v-model="currentLanguage"
                        :items="availableLanguages"
                        hide-details
                        outlined
                        dense
                        attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.DateFormat').toString()">
                    <v-select
                        v-model="dateFormat"
                        :items="dateFormatItems"
                        hide-details
                        outlined
                        dense
                        attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.TimeFormat').toString()">
                    <v-select
                        v-model="timeFormat"
                        :items="timeFormatItems"
                        hide-details
                        outlined
                        dense
                        attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.GeneralTab.CalcPrintProgress').toString()"
                    :sub-title="$t('Settings.GeneralTab.CalcPrintProgressDescription').toString()">
                    <v-select
                        v-model="calcPrintProgress"
                        :items="calcPrintProgressItems"
                        hide-details
                        dense
                        outlined
                        attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.GeneralTab.CalcEstimateTime').toString()"
                    :sub-title="$t('Settings.GeneralTab.CalcEstimateTimeDescription').toString()">
                    <v-select
                        v-model="calcEstimateTime"
                        :items="calcEstimateItems"
                        multiple
                        hide-details
                        dense
                        outlined
                        attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.GeneralTab.CalcEtaTime').toString()"
                    :sub-title="$t('Settings.GeneralTab.CalcEtaTimeDescription').toString()">
                    <v-select
                        v-model="calcEtaTime"
                        :items="calcEtaTimeItems"
                        multiple
                        hide-details
                        dense
                        outlined
                        attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.MoonrakerDb').toString()" :dynamic-slot-width="true">
                    <input
                        ref="uploadBackupFile"
                        type="file"
                        :accept="['.json']"
                        class="d-none"
                        @change="uploadRestore" />
                    <v-btn :loading="loadings.includes('backupDbButton')" small @click="backupDb">
                        {{ $t('Settings.GeneralTab.Backup') }}
                    </v-btn>
                    <v-btn small :loading="loadings.includes('restoreUploadButton')" class="ml-3" @click="restoreDb">
                        {{ $t('Settings.GeneralTab.Restore') }}
                    </v-btn>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.FactoryReset').toString()" :dynamic-slot-width="true">
                    <v-btn color="error" small @click="resetMainsail">
                        {{ $t('Settings.GeneralTab.FactoryReset') }}
                    </v-btn>
                </settings-row>
            </v-card-text>
        </v-card>
        <v-dialog v-model="dialogBackupMainsail" persistent :width="360">
            <panel
                :title="$t('Settings.GeneralTab.Backup').toString()"
                card-class="mainsail-backup-dialog"
                :margin-bottom="false"
                :icon="mdiHelpCircle">
                <template #buttons>
                    <v-btn icon tile @click="dialogBackupMainsail = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <p class="mb-0">{{ $t('Settings.GeneralTab.BackupDialog') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="pl-6">
                            <template v-for="db in mainsailKeys">
                                <v-checkbox
                                    :key="db.name"
                                    :label="db.label"
                                    hide-details
                                    class="mt-0"
                                    @change="changeNamespace(db.name)"></v-checkbox>
                            </template>
                            <v-checkbox
                                v-if="availableNamespaces.includes('timelapse')"
                                :label="$t('Settings.GeneralTab.DbTimelapseSettings')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('timelapse')"></v-checkbox>
                            <v-checkbox
                                v-if="availableNamespaces.includes('webcams')"
                                :label="$t('Settings.GeneralTab.DbWebcams')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('webcams')"></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn color="red" :loading="loadings.includes('backupMainsail')" @click="backupMainsail">
                                {{ $t('Settings.GeneralTab.Backup') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogResetMainsail" persistent :width="360">
            <panel
                :title="$t('Settings.GeneralTab.FactoryReset').toString()"
                card-class="factory-reset-dialog"
                :margin-bottom="false"
                :icon="mdiHelpCircle">
                <template #buttons>
                    <v-btn icon tile @click="dialogResetMainsail = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <p class="mb-0">{{ $t('Settings.GeneralTab.FactoryDialog') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="pl-6">
                            <template v-for="db in mainsailKeys">
                                <v-checkbox
                                    :key="db.name"
                                    :label="db.label"
                                    hide-details
                                    class="mt-0"
                                    @change="changeNamespace(db.name)"></v-checkbox>
                            </template>
                            <v-checkbox
                                v-if="availableNamespaces.includes('timelapse')"
                                :label="$t('Settings.GeneralTab.DbTimelapseSettings')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('timelapse')"></v-checkbox>
                            <v-checkbox
                                v-if="availableNamespaces.includes('webcams')"
                                :label="$t('Settings.GeneralTab.DbWebcams')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('webcams')"></v-checkbox>
                            <v-checkbox
                                v-if="moonrakerComponents.includes('history')"
                                :label="$t('Settings.GeneralTab.DbHistoryJobs')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('history_jobs')"></v-checkbox>
                            <v-checkbox
                                v-if="moonrakerComponents.includes('history')"
                                :label="$t('Settings.GeneralTab.DbHistoryTotals')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('history_totals')"></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                color="red"
                                :loading="loadings.includes('resetMainsail')"
                                @click="resetMainsailAction">
                                {{ $t('Settings.GeneralTab.Reset') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRestoreMainsail" persistent :width="360">
            <panel
                :title="$t('Settings.GeneralTab.Restore').toString()"
                card-class="factory-reset-dialog"
                :margin-bottom="false"
                :icon="mdiHelpCircle">
                <template #buttons>
                    <v-btn icon tile @click="dialogRestoreMainsail = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <p class="mb-0">{{ $t('Settings.GeneralTab.RestoreDialog') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="pl-6">
                            <template v-for="db in restoreableNamespaces">
                                <v-checkbox
                                    :key="db.name"
                                    :label="db.label"
                                    hide-details
                                    class="mt-0"
                                    @change="changeNamespace(db.name)"></v-checkbox>
                            </template>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn color="red" :loading="loadings.includes('restoreMainsail')" @click="restoreDbAction">
                                {{ $t('Settings.GeneralTab.Restore') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import Vue from 'vue'
import { mdiCloseThick, mdiHelpCircle } from '@mdi/js'

@Component({
    components: { Panel, SettingsRow },
})
export default class SettingsGeneralTab extends Mixins(BaseMixin) {
    mdiHelpCircle = mdiHelpCircle
    mdiCloseThick = mdiCloseThick

    private dialogBackupMainsail = false
    private dialogResetMainsail = false
    private dialogRestoreMainsail = false

    private dbCheckboxes: string[] = []

    private restoreableNamespaces: { name: string; label: string }[] = []
    private restoreObjects: any = {}

    private mainsailKeys: { name: string; label: string }[] = []
    private availableNamespaces: string[] = []

    declare $refs: {
        uploadBackupFile: HTMLInputElement
    }

    get availableKeys() {
        return [
            {
                name: 'general',
                label: this.$t('Settings.GeneralTab.General').toString(),
            },
            {
                name: 'console',
                label: this.$t('Settings.ConsoleTab.Console').toString(),
            },
            {
                name: 'control',
                label: this.$t('Settings.ControlTab.Control').toString(),
            },
            {
                name: 'dashboard',
                label: this.$t('Settings.DashboardTab.Dashboard').toString(),
            },
            {
                name: 'editor',
                label: this.$t('Settings.EditorTab.Editor').toString(),
            },
            {
                name: 'gcodeViewer',
                label: this.$t('Settings.GCodeViewerTab.GCodeViewer').toString(),
            },
            {
                name: 'gcodehistory',
                label: this.$t('Settings.GeneralTab.DbConsoleHistory').toString(),
            },
            {
                name: 'macros',
                label: this.$t('Settings.MacrosTab.Macros').toString(),
            },
            {
                name: 'notifications',
                label: this.$t('App.Notifications.Notifications').toString(),
            },
            {
                name: 'presets',
                label: this.$t('Settings.PresetsTab.PreheatPresets').toString(),
            },
            {
                name: 'remoteprinters',
                label: this.$t('Settings.RemotePrintersTab.RemotePrinters').toString(),
            },
            {
                name: 'timelapse',
                label: this.$t('Settings.TimelapseTab.Timelapse').toString(),
            },
            {
                name: 'uiSettings',
                label: this.$t('Settings.UiSettingsTab.UiSettings').toString(),
            },
            {
                name: 'view',
                label: this.$t('Settings.GeneralTab.DbView').toString(),
            },
            {
                name: 'webcams',
                label: this.$t('Settings.WebcamsTab.Webcams').toString(),
            },
        ]
    }

    get printerName() {
        return this.$store.state.gui.general.printername
    }

    set printerName(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'general.printername', value: newVal })
    }

    get currentLanguage() {
        return this.$store.state.gui.general.language
    }

    set currentLanguage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'general.language', value: newVal })
    }

    get availableLanguages() {
        const locales = import.meta.globEager('../../locales/*.json')
        const languages: any = []

        Object.keys(locales).map((file: string) => {
            const langKey = file.slice(file.lastIndexOf('.') - 2, file.lastIndexOf('.'))

            languages.push({
                text: locales[file].title,
                value: langKey,
            })
        })

        return languages
    }

    get dateFormat() {
        return this.$store.state.gui.general.dateFormat
    }

    set dateFormat(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'general.dateFormat', value: newVal })
    }

    get dateFormatItems() {
        const date = new Date()
        const userLocale =
            navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language

        return [
            { value: null, text: `Browser (${date.toLocaleDateString(userLocale, { dateStyle: 'medium' })})` },
            {
                value: '2-digits',
                text: date.toLocaleDateString(userLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }),
            },
            {
                value: 'short',
                text: date.toLocaleDateString(userLocale, { day: '2-digit', month: 'short', year: 'numeric' }),
            },
        ]
    }

    get timeFormat() {
        return this.$store.state.gui.general.timeFormat
    }

    set timeFormat(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'general.timeFormat', value: newVal })
    }

    get timeFormatItems() {
        const date = new Date()
        const userLocale =
            navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language

        return [
            { value: null, text: `Browser (${date.toLocaleTimeString(userLocale, { timeStyle: 'short' })})` },
            {
                value: '24hours',
                text: this.$t('Settings.GeneralTab.24hours', {
                    time: date.toLocaleTimeString(userLocale, { hour: '2-digit', minute: '2-digit', hour12: false }),
                }).toString(),
            },
            {
                value: '12hours',
                text: this.$t('Settings.GeneralTab.12hours', {
                    time: date.toLocaleTimeString(userLocale, { hour: '2-digit', minute: '2-digit', hour12: true }),
                }).toString(),
            },
        ]
    }

    get calcPrintProgressItems() {
        return [
            { value: 'file-relative', text: this.$t('Settings.GeneralTab.CalcPrintProgressItems.FileRelative') },
            { value: 'file-absolute', text: this.$t('Settings.GeneralTab.CalcPrintProgressItems.FileAbsolute') },
            { value: 'slicer', text: this.$t('Settings.GeneralTab.CalcPrintProgressItems.Slicer') },
            { value: 'filament', text: this.$t('Settings.GeneralTab.CalcPrintProgressItems.Filament') },
        ]
    }

    get calcPrintProgress() {
        return this.$store.state.gui.general.calcPrintProgress ?? 'file-relative'
    }

    set calcPrintProgress(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'general.calcPrintProgress', value: newVal })
    }

    get calcEstimateItems() {
        return [
            { value: 'file', text: this.$t('Settings.GeneralTab.EstimateValues.File') },
            { value: 'filament', text: this.$t('Settings.GeneralTab.EstimateValues.Filament') },
        ]
    }

    get calcEstimateTime() {
        return this.$store.state.gui.general.calcEstimateTime
    }

    set calcEstimateTime(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'general.calcEstimateTime', value: newVal })
    }

    get calcEtaTimeItems() {
        return [
            { value: 'file', text: this.$t('Settings.GeneralTab.EstimateValues.File') },
            { value: 'filament', text: this.$t('Settings.GeneralTab.EstimateValues.Filament') },
            { value: 'slicer', text: this.$t('Settings.GeneralTab.EstimateValues.Slicer') },
        ]
    }

    get calcEtaTime() {
        return this.$store.state.gui.general.calcEtaTime
    }

    set calcEtaTime(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'general.calcEtaTime', value: newVal })
    }

    get moonrakerDbNamespaces() {
        return this.$store.state.server.dbNamespaces ?? []
    }

    get moonrakerComponents() {
        return this.$store.state.server.components ?? []
    }

    async refreshNamespaces() {
        this.availableNamespaces = []

        const url = this.$store.getters['socket/getUrl'] + '/server/database/list'
        const response = await fetch(url)
        if (response) {
            const objects = await response.json()
            this.availableNamespaces = [...(objects.result?.namespaces || {})] ?? []
        }
    }

    async refreshMainsailKeys() {
        this.mainsailKeys = []

        const url = this.$store.getters['socket/getUrl'] + '/server/database/item?namespace=mainsail'
        const response = await fetch(url)
        if (response) {
            const objects = await response.json()
            if (objects?.result?.value) {
                Object.keys(objects?.result?.value).forEach((tmp: string) => {
                    if (tmp !== 'initVersion') {
                        const namespace = this.availableKeys.find((namespace) => namespace.name === tmp)
                        const tmpNamespace = namespace ? namespace : { name: tmp, label: tmp }
                        this.mainsailKeys.push(tmpNamespace)
                    }
                })

                this.mainsailKeys = this.mainsailKeys.sort((a, b) => {
                    if (a.name === 'general') return -1
                    if (b.name === 'general') return 1

                    const stringA = a.label.toString().toLowerCase()
                    const stringB = b.label.toString().toLowerCase()

                    if (stringA < stringB) return -1
                    if (stringA > stringB) return 1

                    return 0
                })
            }
        }
    }

    changeNamespace(name: string) {
        if (this.dbCheckboxes.includes(name)) {
            const index = this.dbCheckboxes.indexOf(name)
            if (index >= 0) this.dbCheckboxes.splice(index, 1)
        } else this.dbCheckboxes.push(name)
    }

    async resetMainsail() {
        await this.refreshNamespaces()
        if (this.availableNamespaces.includes('mainsail')) await this.refreshMainsailKeys()
        else this.mainsailKeys = []

        this.dbCheckboxes = []
        this.dialogResetMainsail = true
    }

    async resetMainsailAction() {
        await this.$store.dispatch('socket/addLoading', 'resetMainsail')
        await this.$store.dispatch('gui/resetMoonrakerDB', this.dbCheckboxes)
    }

    async backupDb() {
        await this.$store.dispatch('socket/addLoading', 'backupDbButton')
        await this.refreshNamespaces()
        if (this.availableNamespaces.includes('mainsail')) await this.refreshMainsailKeys()
        else this.mainsailKeys = []

        this.dbCheckboxes = []
        this.dialogBackupMainsail = true
    }

    async backupMainsail() {
        await this.$store.dispatch('socket/addLoading', 'backupMainsail')
        await this.$store.dispatch('gui/backupMoonrakerDB', this.dbCheckboxes)
        await this.$store.dispatch('socket/removeLoading', 'backupMainsail')
        this.dialogBackupMainsail = false
    }

    async restoreDb() {
        await this.$store.dispatch('socket/addLoading', 'restoreUploadButton')
        this.$refs?.uploadBackupFile?.click()
    }

    uploadRestore() {
        if (this.$refs.uploadBackupFile.files?.length) {
            const backup = this.$refs.uploadBackupFile.files[0]
            if (backup) {
                const reader = new FileReader()
                reader.readAsText(backup, 'UTF-8')
                reader.onload = (evt) => {
                    this.restoreableNamespaces = []
                    try {
                        this.restoreObjects = JSON.parse(evt?.target?.result + '')

                        Object.keys(this.restoreObjects).forEach((tmp: string) => {
                            const namespace = this.availableKeys.find((namespace) => namespace.name === tmp)
                            const tmpNamespace = namespace ? namespace : { name: tmp, label: tmp }

                            this.restoreableNamespaces.push(tmpNamespace)
                        })

                        this.restoreableNamespaces = this.restoreableNamespaces.sort((a, b) => {
                            if (a.name === 'general') return -1
                            if (b.name === 'general') return 1

                            const stringA = a.label.toString().toLowerCase()
                            const stringB = b.label.toString().toLowerCase()

                            if (stringA < stringB) return -1
                            if (stringA > stringB) return 1

                            return 0
                        })

                        this.dbCheckboxes = []
                        this.dialogRestoreMainsail = true
                    } catch (e) {
                        Vue.$toast.error(this.$t('Settings.GeneralTab.CannotReadJson') + '')
                    }
                }
                reader.onerror = (evt) => {
                    window.console.error(evt)
                }
            }

            this.$refs.uploadBackupFile.value = ''
        }
    }

    async restoreDbAction() {
        this.$store.dispatch('socket/addLoading', 'restoreDbAction')

        this.$store.dispatch('gui/restoreMoonrakerDB', {
            dbCheckboxes: this.dbCheckboxes,
            restoreObjects: this.restoreObjects,
        })
    }
}
</script>
