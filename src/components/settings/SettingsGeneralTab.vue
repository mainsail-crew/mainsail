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
                    <v-btn @click="resetDbCheckboxes(); dialogBackupMainsail=true" small>{{ $t('Settings.GeneralTab.Backup') }}</v-btn>
                    <v-btn @click="restoreDb()" small :loading="loadings.includes('restoreUploadButton')" class="ml-3">{{ $t('Settings.GeneralTab.Restore') }}</v-btn>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GeneralTab.FactoryReset')" :dynamicSlotWidth="true">
                    <v-btn @click="resetDbCheckboxes(); dialogResetMainsail=true" color="error" small>{{ $t('Settings.GeneralTab.FactoryReset') }}</v-btn>
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
                            <p class="mb-0">{{ $t('Settings.GeneralTab.Backup') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="pl-6">
                            <template v-for="db in availableDbs">
                                <v-checkbox
                                    v-model="dbCheckboxes[db.name]"
                                    :label="db.label"
                                    v-if="moonrakerDbNamespaces.includes(db.name)"
                                    hide-details
                                    class="mt-0"
                                    :key="db.name"
                                ></v-checkbox>
                            </template>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                color="red"
                                @click="backupMainsail"
                                :loading="dialogBackupMainsailLoading"
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
                            <template v-for="db in availableDbs">
                                <v-checkbox
                                    v-model="dbCheckboxes[db.name]"
                                    :label="db.label"
                                    v-if="moonrakerDbNamespaces.includes(db.name)"
                                    hide-details
                                    class="mt-0"
                                    :key="db.name"
                                ></v-checkbox>
                            </template>
                            <v-checkbox
                                v-model="dbCheckboxes.history_jobs"
                                :label="$t('Settings.GeneralTab.DbHistoryJobs')"
                                v-if="moonrakerComponents.includes('history')"
                                hide-details
                                class="mt-0"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="dbCheckboxes.history_totals"
                                :label="$t('Settings.GeneralTab.DbHistoryTotals')"
                                v-if="moonrakerComponents.includes('history')"
                                hide-details
                                class="mt-0"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                color="red"
                                @click="resetMainsail"
                                :loading="dialogResetMainsailLoading"
                            >
                                {{ $t('Settings.GeneralTab.Reset') }}
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

@Component({
    components: {Panel, SettingsRow}
})
export default class SettingsGeneralTab extends Mixins(BaseMixin) {
    private dialogBackupMainsail = false
    private dialogBackupMainsailLoading = false

    private dialogResetMainsail = false
    private dialogResetMainsailLoading = false

    private dbCheckboxes: {[key: string]: boolean} = {
        mainsail: false,
        mainsail_presets: false,
        mainsail_gcodehistory: false,
        mainsail_macrogroups: false,
        mainsail_remoteprinters: false,
        timelapse: false,
        history_jobs: false,
        history_totals: false,
    }

    $refs!: {
        uploadBackupFile: HTMLInputElement
    }

    get availableDbs() {
        return [
            {
                name: 'mainsail',
                label: this.$t('Settings.GeneralTab.DbGeneral')
            }, {
                name: 'mainsail_presets',
                label: this.$t('Settings.GeneralTab.DbPresets')
            }, {
                name: 'mainsail_gcodehistory',
                label: this.$t('Settings.GeneralTab.DbGcodehistry')
            }, {
                name: 'mainsail_macrogroups',
                label: this.$t('Settings.GeneralTab.DbMacrogroups')
            }, {
                name: 'mainsail_remoteprinters',
                label: this.$t('Settings.GeneralTab.DbRemoteprinters')
            }, {
                name: 'webcams',
                label: this.$t('Settings.GeneralTab.DbWebcams')
            }, {
                name: 'timelapse',
                label: this.$t('Settings.GeneralTab.DbTimelapseSettings')
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

    resetDbCheckboxes() {
        Object.keys(this.dbCheckboxes).forEach((dbname: string) => {
            this.dbCheckboxes[dbname] = false
        })
    }

    restoreDb() {
        window.console.log('restore DB')
        this.$store.dispatch('socket/addLoading', 'restoreUploadButton')
        this.$refs?.uploadBackupFile?.click()
    }

    uploadRestore() {
        window.console.log('upload DB', this.$refs.uploadBackupFile)
        if (this.$refs.uploadBackupFile.files?.length) {
            window.console.log(this.$refs.uploadBackupFile.files)

            const backup = this.$refs.uploadBackupFile.files[0]
            if (backup) {
                const reader = new FileReader()
                reader.readAsText(backup, 'UTF-8')
                reader.onload = function (evt) {
                    window.console.log(evt?.target?.result)
                }
                reader.onerror = function (evt) {
                    window.console.log(evt)
                }
            }
        }
    }

    resetMainsail() {
        this.$store.dispatch('gui/resetMoonrakerDB', this.dbCheckboxes)
        this.dialogResetMainsailLoading = true
    }

    async backupMainsail() {
        this.dialogBackupMainsailLoading = true
        await this.$store.dispatch('gui/backupMoonrakerDB', this.dbCheckboxes)
        this.dialogBackupMainsailLoading = false
        this.dialogBackupMainsail = false
    }
}
</script>