<style scoped></style>

<template>
    <panel
        v-if="klipperReadyForGui && macros.length > 0 && macrogroupStatus"
        :icon="mdiCodeTags"
        :title="macrogroup.name"
        :collapsible="true"
        :card-class="'macrogroup_' + panelId + '_panel'">
        <v-card-text class="py-2">
            <v-row>
                <v-col class="text-center">
                    <macro-button
                        v-for="(macro, index) in macros"
                        :key="'macroparam_' + index"
                        :macro="macro"
                        :color="getColor(macro)"
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
import { PrinterStateMacro } from '@/store/printer/types'
import { GuiMacrosStateMacrogroupMacro } from '@/store/gui/macros/types'
import { mdiCodeTags } from '@mdi/js'

const props = defineProps<{
    panelId: string
}>()

const { klipperReadyForGui, printer_state } = useBase()

const store = useStore()

const macrogroup = computed(() =>
    store.getters['gui/macros/getMacrogroup'](props.panelId)
)

const allMacros = computed(() =>
    store.getters['printer/getMacros'] ?? []
)

const macros = computed(() => {
    let result = macrogroup.value?.macros ?? []

    result = result.filter((macro: GuiMacrosStateMacrogroupMacro) => {
        if (
            !allMacros.value.find(
                (existMacro: PrinterStateMacro) => existMacro.name.toLowerCase() === macro.name.toLowerCase()
            )
        )
            return false

        return (
            (macro.showInStandby && ['standby', 'cancelled', 'complete', 'error'].includes(printer_state.value)) ||
            (macro.showInPause && printer_state.value === 'paused') ||
            (macro.showInPrinting && printer_state.value === 'printing')
        )
    })

    return result.sort((a: GuiMacrosStateMacrogroupMacro, b: GuiMacrosStateMacrogroupMacro) => a.pos - b.pos)
})

const macrogroupStatus = computed(() =>
    (
        (macrogroup.value.showInStandby &&
            ['standby', 'cancelled', 'complete', 'error'].includes(printer_state.value)) ||
        (macrogroup.value.showInPause && printer_state.value === 'paused') ||
        (macrogroup.value.showInPrinting && printer_state.value === 'printing')
    )
)

function getColor(macro: GuiMacrosStateMacrogroupMacro) {
    if (macro.color === 'group') {
        if (macrogroup.value.color === 'custom') return macrogroup.value.colorCustom
        else return macrogroup.value.color
    }

    return macro.color
}
</script>
