<style scoped></style>

<template>
    <div>
        <v-card v-if="!form.bool" flat>
            <v-card-text>
                <div class="d-flex align-center">
                    <v-icon style="opacity: 0.7">{{ mdiConsoleLine }}</v-icon>
                    <v-card-title class="mx-n2">
                        {{ $t('Settings.ConsoleTab.Console') }}
                    </v-card-title>
                    <v-divider class="ml-3"></v-divider>
                </div>
                <settings-row :title="$t('Settings.ConsoleTab.Direction').toString()">
                    <v-select
                        v-model="consoleDirection"
                        :items="availableDirections"
                        hide-details
                        outlined
                        dense
                        attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.ConsoleTab.EntryStyle').toString()">
                    <v-select
                        v-model="entryStyle"
                        :items="availableEntryStyles"
                        hide-details
                        outlined
                        dense
                        attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.ConsoleTab.Height').toString()">
                    <v-slider
                        v-model="consoleHeightTmp"
                        hide-details
                        :min="200"
                        :max="900"
                        :step="10"
                        :label="consoleHeightTmp + 'px'"
                        @change="updateConsoleHeight"></v-slider>
                </settings-row>
                <div class="d-flex align-center">
                    <v-icon style="opacity: 0.7">{{ mdiFilter }}</v-icon>
                    <v-card-title class="mx-n2">
                        {{ $t('Settings.ConsoleTab.Filters') }}
                    </v-card-title>
                    <v-divider class="ml-3"></v-divider>
                </div>
                <settings-row :title="$t('Settings.ConsoleTab.HideTemperatures').toString()" :dynamic-slot-width="true">
                    <v-switch v-model="hideWaitTemperatures" hide-details class="mt-0"></v-switch>
                </settings-row>
                <template v-if="moonrakerComponents.includes('timelapse')">
                    <v-divider class="my-2"></v-divider>
                    <settings-row
                        :title="$t('Settings.ConsoleTab.HideTimelapse').toString()"
                        :dynamic-slot-width="true">
                        <v-switch v-model="hideTimelapse" hide-details class="mt-0"></v-switch>
                    </settings-row>
                </template>
                <v-divider class="my-2"></v-divider>
                <div v-for="(filter, index) in consoleFilters" :key="index">
                    <v-divider v-if="index" class="my-2"></v-divider>
                    <settings-row :title="filter.name">
                        <v-btn
                            small
                            outlined
                            class="minwidth-0 px-2"
                            :color="filter.bool ? 'white' : 'grey'"
                            @click="toggleFilter(filter)">
                            <v-icon small>{{ filter.bool ? mdiFilter : mdiFilterOff }}</v-icon>
                        </v-btn>
                        <v-btn small outlined class="ml-3" @click="editFilter(filter)">
                            <v-icon left small>{{ mdiPencil }}</v-icon>
                            {{ $t('Settings.Edit') }}
                        </v-btn>
                        <v-btn
                            small
                            outlined
                            class="ml-3 minwidth-0 px-2"
                            color="error"
                            @click="deleteFilter(filter.id)">
                            <v-icon small>{{ mdiDelete }}</v-icon>
                        </v-btn>
                    </settings-row>
                </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text color="primary" @click="createFilter">{{ $t('Settings.ConsoleTab.AddFilter') }}</v-btn>
            </v-card-actions>
        </v-card>
        <v-card v-else flat>
            <v-form v-model="form.valid" @submit.prevent="saveFilter">
                <v-card-title>
                    {{
                        form.id === null
                            ? $t('Settings.ConsoleTab.CreateHeadline')
                            : $t('Settings.ConsoleTab.EditHeadline')
                    }}
                </v-card-title>
                <v-card-text>
                    <settings-row :title="$t('Settings.ConsoleTab.Name').toString()">
                        <v-text-field
                            v-model="form.name"
                            hide-details="auto"
                            :rules="[rules.required, rules.unique]"
                            dense
                            outlined></v-text-field>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.ConsoleTab.Regex').toString()">
                        <v-textarea v-model="form.regex" outlined hide-details="auto"></v-textarea>
                    </settings-row>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                    <v-btn text @click="form.bool = false">
                        {{ $t('Settings.Cancel') }}
                    </v-btn>
                    <v-btn color="primary" text type="submit">
                        {{
                            form.id === null
                                ? $t('Settings.ConsoleTab.StoreButton')
                                : $t('Settings.ConsoleTab.UpdateButton')
                        }}
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { Debounce } from 'vue-debounce-decorator'
import { mdiFilter, mdiPencil, mdiFilterOff, mdiDelete, mdiConsoleLine } from '@mdi/js'

interface consoleForm {
    bool: boolean
    id: string | null
    valid: boolean
    name: string
    regex: string
}

@Component({
    components: { SettingsRow },
})
export default class SettingsConsoleTab extends Mixins(BaseMixin) {
    mdiFilter = mdiFilter
    mdiFilterOff = mdiFilterOff
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete
    mdiConsoleLine = mdiConsoleLine

    private form: consoleForm = {
        bool: false,
        valid: false,
        name: '',
        regex: '',
        id: null,
    }

    private rules = {
        required: (value: string) => value !== '' || 'required',
        unique: (value: string) => !this.existsPresetName(value) || 'Name already exists',
    }

    private consoleHeightTmp = 300

    mounted() {
        this.consoleHeightTmp = this.consoleHeight
    }

    get consoleFilters() {
        return this.$store.getters['gui/console/getConsolefilters'] ?? []
    }

    get availableDirections() {
        return [
            {
                text: this.$t('Settings.ConsoleTab.DirectionTable'),
                value: 'table',
            },
            {
                text: this.$t('Settings.ConsoleTab.DirectionShell'),
                value: 'shell',
            },
        ]
    }

    get consoleDirection() {
        return this.$store.state.gui.console.direction ?? 'table'
    }

    set consoleDirection(newVal) {
        this.$store.dispatch('gui/console/saveSetting', { name: 'direction', value: newVal })
    }

    get availableEntryStyles() {
        return [
            {
                text: this.$t('Settings.ConsoleTab.EntryStyleDefault'),
                value: 'default',
            },
            {
                text: this.$t('Settings.ConsoleTab.EntryStyleCompact'),
                value: 'compact',
            },
        ]
    }

    get entryStyle() {
        return this.$store.state.gui.console.entryStyle ?? 'default'
    }

    set entryStyle(newVal) {
        this.$store.dispatch('gui/console/saveSetting', { name: 'entryStyle', value: newVal })
    }

    get consoleHeight() {
        return this.$store.state.gui.console.height ?? 300
    }

    set consoleHeight(newVal) {
        this.$store.dispatch('gui/console/saveSetting', { name: 'height', value: newVal })
    }

    @Watch('consoleHeight')
    consoleHeightChanged(newVal: number) {
        this.consoleHeightTmp = newVal
    }

    @Debounce(500)
    updateConsoleHeight(newVal: number) {
        this.consoleHeight = newVal
    }

    get hideWaitTemperatures() {
        return this.$store.state.gui.console.hideWaitTemperatures
    }

    set hideWaitTemperatures(newVal) {
        this.$store.dispatch('gui/console/saveSetting', { name: 'hideWaitTemperatures', value: newVal })
    }

    get hideTimelapse() {
        return this.$store.state.gui.console.hideTlCommands
    }

    set hideTimelapse(newVal) {
        this.$store.dispatch('gui/console/saveSetting', { name: 'hideTlCommands', value: newVal })
    }

    existsPresetName(name: string) {
        return this.consoleFilters.findIndex((filter: any) => filter.name === name && filter.id !== this.form.id) >= 0
    }

    clearForm() {
        this.form.bool = false
        this.form.id = null
        this.form.name = ''
        this.form.regex = ''
    }

    toggleFilter(filter: any) {
        const values = {
            name: filter.name,
            bool: !filter.bool,
            regex: filter.regex,
        }

        this.$store.dispatch('gui/console/filterUpdate', { id: filter.id, values })
    }

    createFilter() {
        this.clearForm()
        this.form.bool = true
    }

    editFilter(filter: any) {
        this.form.name = filter.name
        this.form.id = filter.id
        this.form.regex = filter.regex

        this.form.bool = true
    }

    saveFilter() {
        if (this.form.valid) {
            const filter = {
                name: this.form.name,
                bool: this.form.bool,
                regex: this.form.regex,
            }

            if (this.form.id) this.$store.dispatch('gui/console/filterUpdate', { id: this.form.id, values: filter })
            else this.$store.dispatch('gui/console/filterStore', { values: filter })

            this.clearForm()
        }
    }

    deleteFilter(id: string) {
        this.$store.dispatch('gui/console/filterDelete', id)
    }
}
</script>
