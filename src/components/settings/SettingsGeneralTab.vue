<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.GeneralTab.PrinterName')">
                    <v-text-field v-model="printerName" hide-details outlined dense ></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.Language')">
                    <v-select v-model="currentLanguage" :items="availableLanguages" hide-details outlined dense attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.CalcEstimateTime')" :sub-title="$t('Settings.GeneralTab.CalcEstimateTimeDescription')">
                    <v-select v-model="calcEstimateTime" :items="calcEstimateItems" multiple hide-details dense outlined attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.CalcEtaTime')" :sub-title="$t('Settings.GeneralTab.CalcEtaTimeDescription')">
                    <v-select v-model="calcEtaTime" :items="calcEtaTimeItems" multiple hide-details dense outlined attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.MoonrakerDb')" :dynamicSlotWidth="true">
                    <input type="file" :accept="['.json']" ref="uploadBackupFile" class="d-none" @change="uploadRestore" />
                    <v-btn @click="backupDb" :loading="loadings.includes('backupDbButton')" small>{{ $t('Settings.GeneralTab.Backup') }}</v-btn>
                    <v-btn @click="restoreDb" small :loading="loadings.includes('restoreUploadButton')" class="ml-3">{{ $t('Settings.GeneralTab.Restore') }}</v-btn>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.FactoryReset')" :dynamicSlotWidth="true">
                    <v-btn @click="resetMainsail" color="error" small>{{ $t('Settings.GeneralTab.FactoryReset') }}</v-btn>
                </settings-row>
            </v-card-text>
        </v-card>
        <v-dialog v-model="dialogBackupMainsail" persistent :width="360">
            <panel :title="$t('Settings.GeneralTab.Backup')" card-class="mainsail-backup-dialog" :margin-bottom="false" icon="mdi-help-circle">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogBackupMainsail = false"><v-icon>mdi-close-thick</v-icon></v-btn>
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
                                    :label="db.label"
                                    hide-details
                                    class="mt-0"
                                    :key="db.name"
                                    @change="changeNamespace(db.name)"
                                ></v-checkbox>
                            </template>
                            <v-checkbox
                                :label="$t('Settings.GeneralTab.DbTimelapseSettings')"
                                v-if="availableNamespaces.includes('timelapse')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('timelapse')"
                            ></v-checkbox>
                            <v-checkbox
                                :label="$t('Settings.GeneralTab.DbWebcams')"
                                v-if="availableNamespaces.includes('webcams')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('webcams')"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                color="red"
                                @click="backupMainsail"
                                :loading="loadings.includes('backupMainsail')"
                            >
                                {{ $t('Settings.GeneralTab.Backup') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogResetMainsail" persistent :width="360">
            <panel :title="$t('Settings.GeneralTab.FactoryReset')" card-class="factory-reset-dialog" :margin-bottom="false" icon="mdi-help-circle">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogResetMainsail = false"><v-icon>mdi-close-thick</v-icon></v-btn>
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
                                    :label="db.label"
                                    hide-details
                                    class="mt-0"
                                    :key="db.name"
                                    @change="changeNamespace(db.name)"
                                ></v-checkbox>
                            </template>
                            <v-checkbox
                                :label="$t('Settings.GeneralTab.DbTimelapseSettings')"
                                v-if="availableNamespaces.includes('timelapse')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('timelapse')"
                            ></v-checkbox>
                            <v-checkbox
                                :label="$t('Settings.GeneralTab.DbWebcams')"
                                v-if="availableNamespaces.includes('webcams')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('webcams')"
                            ></v-checkbox>
                            <v-checkbox
                                :label="$t('Settings.GeneralTab.DbHistoryJobs')"
                                v-if="moonrakerComponents.includes('history')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('history_jobs')"
                            ></v-checkbox>
                            <v-checkbox
                                :label="$t('Settings.GeneralTab.DbHistoryTotals')"
                                v-if="moonrakerComponents.includes('history')"
                                hide-details
                                class="mt-0"
                                @change="changeNamespace('history_totals')"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                color="red"
                                @click="resetMainsailAction"
                                :loading="loadings.includes('resetMainsail')"
                            >
                                {{ $t('Settings.GeneralTab.Reset') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRestoreMainsail" persistent :width="360">
            <panel :title="$t('Settings.GeneralTab.Restore')" card-class="factory-reset-dialog" :margin-bottom="false" icon="mdi-help-circle">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogRestoreMainsail = false"><v-icon>mdi-close-thick</v-icon></v-btn>
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
                                    :label="db.label"
                                    hide-details
                                    class="mt-0"
                                    :key="db.name"
                                    @change="changeNamespace(db.name)"
                                ></v-checkbox>
                            </template>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                color="red"
                                @click="restoreDbAction"
                                :loading="loadings.includes('restoreMainsail')"
                            >
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

@Component({
    components: {Panel, SettingsRow}
})
export default class SettingsGeneralTab extends Mixins(BaseMixin) {
    private dialogBackupMainsail = false
    private dialogResetMainsail = false
    private dialogRestoreMainsail = false

    private dbCheckboxes: string[] = []

    private restoreableNamespaces: { name: string, label: string}[] = []
    private restoreObjects: any = {}

    private mainsailKeys: { name: string, label: string}[] = []
    private availableNamespaces: string[] = []

    $refs!: {
        uploadBackupFile: HTMLInputElement
    }

    get availableKeys() {
        return [
            {
                name: 'general',
                label: this.$t('Settings.GeneralTab.General')+''
            }, {
                name: 'console',
                label: this.$t('Settings.ConsoleTab.Console')+''
            }, {
                name: 'control',
                label: this.$t('Settings.ControlTab.Control')+''
            }, {
                name: 'dashboard',
                label: this.$t('Settings.DashboardTab.Dashboard')+''
            }, {
                name: 'editor',
                label: this.$t('Settings.EditorTab.Editor')+''
            }, {
                name: 'gcodeviewer',
                label: this.$t('Settings.GCodeViewerTab.GCodeViewer')+''
            }, {
                name: 'gcodehistory',
                label: this.$t('Settings.GeneralTab.DbConsoleHistory')+''
            }, {
                name: 'macros',
                label: this.$t('Settings.MacrosTab.Macros')+''
            }, {
                name: 'presets',
                label: this.$t('Settings.PresetsTab.PreheatPresets')+''
            }, {
                name: 'remoteprinters',
                label: this.$t('Settings.RemotePrintersTab.RemotePrinters')+''
            }, {
                name: 'timelapse',
                label: this.$t('Settings.TimelapseTab.Timelapse')+''
            }, {
                name: 'uiSettings',
                label: this.$t('Settings.UiSettingsTab.UiSettings')+''
            }, {
                name: 'view',
                label: this.$t('Settings.GeneralTab.DbView')+''
            }, {
                name: 'webcams',
                label: this.$t('Settings.WebcamsTab.Webcams')+''
            }
        ]
    }

    get printerName() {
        return this.$store.state.gui.general.printername
    }

    set printerName(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'general.printername', value: newVal})
    }

    get currentLanguage() {
        return this.$store.state.gui.general.language
    }

    set currentLanguage(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'general.language', value: newVal })
    }

    get availableLanguages() {
        // eslint-disable-next-line no-undef
        const locales = require.context('@/locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
        const languages: any = []

        locales.keys().map((key: string) => {
            const langKey = key.slice(2, key.lastIndexOf('.'))

            languages.push({
                text: locales(key).title,
                value: langKey
            })
        })

        return languages
    }

    get calcEstimateItems() {
        return [
            { value: 'file', text: 'File' },
            { value: 'filament', text: 'Filament' },
        ]
    }

    get calcEstimateTime() {
        return this.$store.state.gui.general.calcEstimateTime
    }

    set calcEstimateTime(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'general.calcEstimateTime', value: newVal })
    }

    get calcEtaTimeItems() {
        return [
            { value: 'file', text: 'File' },
            { value: 'filament', text: 'Filament' },
            { value: 'slicer', text: 'Slicer' },
        ]
    }

    get calcEtaTime() {
        return this.$store.state.gui.general.calcEtaTime
    }

    set calcEtaTime(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'general.calcEtaTime', value: newVal })
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
            this.availableNamespaces = [...objects.result?.namespaces] ?? []
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
        this.$store.dispatch('socket/addLoading', 'backupDbButton')
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
        this.$store.dispatch('socket/addLoading', 'restoreUploadButton')
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
                        this.restoreObjects = JSON.parse(evt?.target?.result+'')

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
                        Vue.$toast.error(this.$t('Settings.GeneralTab.CannotReadJson')+'')
                    }
                }
                reader.onerror = (evt) => {
                    window.console.error(evt)
                }
            }

            this.$refs.uploadBackupFile.value = ''
        }
    }

    async restoreDbAction () {
        this.$store.dispatch('socket/addLoading', 'restoreDbAction')

        this.$store.dispatch('gui/restoreMoonrakerDB', {
            dbCheckboxes: this.dbCheckboxes,
            restoreObjects: this.restoreObjects
        })
    }
}
</script>