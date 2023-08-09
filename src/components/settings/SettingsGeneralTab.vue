<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.GeneralTab.PrinterName')">
                    <v-text-field v-model="printerName" hide-details outlined dense></v-text-field>
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.GeneralTab.Language')">
                    <v-select v-model="currentLanguage" :items="availableLanguages" hide-details outlined dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.GeneralTab.DateFormat')">
                    <v-select v-model="dateFormat" :items="dateFormatItems" hide-details outlined dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.GeneralTab.TimeFormat')">
                    <v-select v-model="timeFormat" :items="timeFormatItems" hide-details outlined dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.GeneralTab.CalcPrintProgress')"
                    :sub-title="$t('Settings.GeneralTab.CalcPrintProgressDescription')">
                    <v-select v-model="calcPrintProgress" :items="calcPrintProgressItems" hide-details dense outlined />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.GeneralTab.CalcEstimateTime')"
                    :sub-title="$t('Settings.GeneralTab.CalcEstimateTimeDescription')">
                    <v-select
                        v-model="calcEstimateTime"
                        :items="calcEstimateItems"
                        multiple
                        hide-details
                        dense
                        outlined />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.GeneralTab.CalcEtaTime')"
                    :sub-title="$t('Settings.GeneralTab.CalcEtaTimeDescription')">
                    <v-select v-model="calcEtaTime" :items="calcEtaTimeItems" multiple hide-details dense outlined />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.GeneralTab.MainsailSettingsMoonrakerDb')" :dynamic-slot-width="true">
                    <settings-general-tab-backup-database />
                    <settings-general-tab-restore-database />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.GeneralTab.FactoryReset')" :dynamic-slot-width="true">
                    <settings-general-tab-reset-database />
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiHelpCircle } from '@mdi/js'
import CheckboxList from '@/components/inputs/CheckboxList.vue'
import SettingsGeneralTabBackupDatabase from '@/components/settings/General/GeneralBackup.vue'
import SettingsGeneralTabRestoreDatabase from '@/components/settings/General/GeneralRestore.vue'
import SettingsGeneralTabResetDatabase from '@/components/settings/General/GeneralReset.vue'
import SettingsGeneralDatabase from '@/components/mixins/settingsGeneralDatabase'

@Component({
    components: {
        Panel,
        SettingsRow,
        CheckboxList,
        SettingsGeneralTabBackupDatabase,
        SettingsGeneralTabRestoreDatabase,
        SettingsGeneralTabResetDatabase,
    },
})
export default class SettingsGeneralTab extends Mixins(BaseMixin, SettingsGeneralDatabase) {
    mdiHelpCircle = mdiHelpCircle
    mdiCloseThick = mdiCloseThick

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
        const locales = import.meta.glob('../../locales/*.json', { eager: true }) as { [key: string]: any }
        const languages: { text: string; value: string }[] = []

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
                    time: date.toLocaleTimeString(userLocale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
                }),
            },
            {
                value: '12hours',
                text: this.$t('Settings.GeneralTab.12hours', {
                    time: date.toLocaleTimeString(userLocale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h12' }),
                }),
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
}
</script>
