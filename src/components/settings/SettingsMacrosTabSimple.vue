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
            <template v-for="(macro, index) in macros" :key="index">
                <v-divider v-if="index" class="my-2" />
                <settings-row
                    :title="macro.name"
                    :sub-title="macro.description"
                    :dynamic-slot-width="true">
                    <v-switch
                        :input-value="getMacroStatus(macro.name)"
                        hide-details
                        class="mt-0"
                        @change="toggleMacroStatus(macro.name)"></v-switch>
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiMagnify } from '@mdi/js'
import type { PrinterStateMacro } from '@/store/printer/types'

const store = useStore()

const searchMacros = ref('')

const macros = computed(() => {
    const macrosList = store.getters['printer/getMacros'] ?? []
    return macrosList.filter((macro: PrinterStateMacro) => {
        return (
            macro.name.toLowerCase().includes(searchMacros.value.toLowerCase()) ||
            macro.description?.toLowerCase().includes(searchMacros.value.toLowerCase())
        )
    })
})

const hiddenMacros = computed(() => store.state.gui.macros.hiddenMacros ?? [])

function getMacroStatus(name: string) {
    return !hiddenMacros.value.includes(name.toUpperCase())
}

function changeMacroStatus(name: string) {
    const newHiddenMacros = [...hiddenMacros.value]

    if (newHiddenMacros.includes(name.toUpperCase()))
        newHiddenMacros.splice(newHiddenMacros.indexOf(name.toUpperCase()), 1)
    else newHiddenMacros.push(name.toUpperCase())

    store.dispatch('gui/macros/saveSetting', { name: 'hiddenMacros', value: newHiddenMacros })
}
</script>
