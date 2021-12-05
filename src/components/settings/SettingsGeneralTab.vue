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
                <settings-row :title="$t('Settings.GeneralTab.FactoryReset')" :dynamicSlotWidth="true">
                    <v-btn @click="dialogResetMainsail=true" color="error" small>{{ $t('Settings.GeneralTab.FactoryReset') }}</v-btn>
                </settings-row>
            </v-card-text>
        </v-card>
        <v-dialog v-model="dialogResetMainsail" persistent :width="360">
            <panel :title="$t('Settings.GeneralTab.FactoryReset')" card-class="ractory-reset-dialog" :margin-bottom="false" icon="mdi-help-circle">
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
                            <v-checkbox
                                v-model="dbCheckboxes.mainsail"
                                :label="$t('Settings.GeneralTab.DbGeneral')"
                                v-if="moonrakerDbNamespaces.includes('mainsail')"
                                hide-details
                                class="mt-0"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="dbCheckboxes.mainsail_presets"
                                :label="$t('Settings.GeneralTab.DbPresets')"
                                v-if="moonrakerDbNamespaces.includes('mainsail_presets')"
                                hide-details
                                class="mt-0"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="dbCheckboxes.mainsail_macrogroups"
                                :label="$t('Settings.GeneralTab.DbMacrogroups')"
                                v-if="moonrakerDbNamespaces.includes('mainsail_macrogroups')"
                                hide-details
                                class="mt-0"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="dbCheckboxes.mainsail_remoteprinters"
                                :label="$t('Settings.GeneralTab.DbRemoteprinters')"
                                v-if="moonrakerDbNamespaces.includes('mainsail_remoteprinters')"
                                hide-details
                                class="mt-0"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="dbCheckboxes.webcams"
                                :label="$t('Settings.GeneralTab.DbWebcams')"
                                v-if="moonrakerDbNamespaces.includes('webcams')"
                                hide-details
                                class="mt-0"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="dbCheckboxes.timelapse"
                                :label="$t('Settings.GeneralTab.DbTimelapseSettings')"
                                v-if="moonrakerDbNamespaces.includes('timelapse')"
                                hide-details
                                class="mt-0"
                            ></v-checkbox>
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
    private dialogResetMainsail = false
    private dialogResetMainsailLoading = false
    private dbCheckboxes = {
        mainsail: false,
        mainsail_presets: false,
        mainsail_macrogroups: false,
        mainsail_remoteprinters: false,
        timelapse: false,
        history_jobs: false,
        history_totals: false,
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

    resetMainsail() {
        this.$store.dispatch('gui/resetMoonrakerDB', this.dbCheckboxes)
        this.dialogResetMainsailLoading = true
    }
}
</script>