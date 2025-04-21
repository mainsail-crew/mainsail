<template>
    <v-card-text>
        <v-row class="mt-6 mb-3 flex-column flex-md-row">
            <v-col class="py-0 align-content-center mb-3 mb-md-0">
                <h3 class="text-h5">{{ $t('Settings.MacrosTab.Macros') }}</h3>
            </v-col>
            <v-col class="py-0">
                <v-text-field
                    v-model="searchMacros"
                    :append-icon="mdiMagnify"
                    :label="$t('Settings.MacrosTab.Search')"
                    single-line
                    outlined
                    clearable
                    hide-details
                    dense />
            </v-col>
        </v-row>
        <template v-if="macros.length">
            <template v-for="(macro, index) in macros">
                <v-divider v-if="index" :key="index + '_divider'" class="my-2" />
                <settings-row
                    :key="index"
                    :title="macro.name"
                    :sub-title="macro.description"
                    :dynamic-slot-width="true">
                    <v-switch
                        :input-value="getMacroStatus(macro.name)"
                        hide-details
                        class="mt-0"
                        @change="changeMacroStatus(macro.name)" />
                </settings-row>
            </template>
        </template>
        <v-row v-else>
            <v-col>
                <p class="mb-0 text-center font-italic">{{ $t('Settings.MacrosTab.NOMacros') }}</p>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiMagnify } from '@mdi/js'

@Component({
    components: { SettingsRow },
})
export default class SettingsMacrosTabSimple extends Mixins(BaseMixin) {
    mdiMagnify = mdiMagnify
    searchMacros: string = ''

    get macros() {
        const macros = this.$store.getters['printer/getMacros'] ?? []
        return macros.filter((macro: any) => {
            return (
                macro.name.toLowerCase().includes(this.searchMacros.toLowerCase()) ||
                macro.description.toLowerCase().includes(this.searchMacros.toLowerCase())
            )
        })
    }

    get hiddenMacros() {
        return this.$store.state.gui.macros.hiddenMacros ?? []
    }

    getMacroStatus(name: string) {
        return !this.hiddenMacros.includes(name.toUpperCase())
    }

    changeMacroStatus(name: string) {
        const hiddenMacros = [...this.hiddenMacros]

        if (this.hiddenMacros.includes(name.toUpperCase()))
            hiddenMacros.splice(hiddenMacros.indexOf(name.toUpperCase()), 1)
        else hiddenMacros.push(name.toUpperCase())

        this.$store.dispatch('gui/macros/saveSetting', { name: 'hiddenMacros', value: hiddenMacros })
    }
}
</script>
