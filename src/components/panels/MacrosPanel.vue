<template>
    <panel
        v-if="klipperReadyForGui && macros.length > 0"
        :icon="mdiCodeTags"
        :title="$t('Panels.MacrosPanel.Headline')"
        :collapsible="true"
        card-class="macros-panel">
        <v-card-text class="py-2">
            <v-row>
                <v-col class="text-center">
                    <macro-button
                        v-for="(macro, index) in macros"
                        :key="'macro_' + index"
                        :macro="macro"
                        color="primary"
                        class="mx-1 my-1" />
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import MacroButton from '@/components/inputs/MacroButton.vue'
import { mdiCodeTags } from '@mdi/js'
import { PrinterStateMacro } from '@/store/printer/types'

const { klipperReadyForGui } = useBase()

const store = useStore()

const hiddenMacros = computed(() =>
    (store.state.gui?.macros?.hiddenMacros ?? []).map((name: string) => name.toLowerCase())
)

const macros = computed(() => {
    const allMacros = store.getters['printer/getMacros']
    return allMacros.filter((macro: PrinterStateMacro) => !hiddenMacros.value.includes(macro.name.toLowerCase()))
})
</script>
