<template>
    <v-card-text>
        <h3 class="text-h5 mt-6 mb-3">{{ $t('Settings.MacrosTab.Macros') }}</h3>
        <template v-if="macros.length">
            <div v-for="(macro, index) in macros" :key="index">
                <v-divider v-if="index" class="my-2"></v-divider>
                <settings-row :title="macro.name" :sub-title="macro.description" :dynamic-slot-width="true">
                    <v-switch
                        :input-value="getMacroStatus(macro.name)"
                        hide-details
                        class="mt-0"
                        @change="changeMacroStatus(macro.name)"></v-switch>
                </settings-row>
            </div>
        </template>
        <template v-else>
            <v-row>
                <v-col>
                    <p class="mb-0 text-center font-italic">{{ $t('Settings.MacrosTab.NOMacros') }}</p>
                </v-col>
            </v-row>
        </template>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
@Component({
    components: { SettingsRow },
})
export default class SettingsMacrosTabSimple extends Mixins(BaseMixin) {
    get macros() {
        return this.$store.getters['printer/getMacros'] ?? []
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
