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

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import MacroButton from '@/components/inputs/MacroButton.vue'
import { PrinterStateMacro } from '@/store/printer/types'
import { GuiMacrosStateMacrogroupMacro } from '@/store/gui/macros/types'
import { mdiCodeTags } from '@mdi/js'
@Component({
    components: { MacroButton, Panel },
})
export default class MacrogroupPanel extends Mixins(BaseMixin) {
    mdiCodeTags = mdiCodeTags

    @Prop({ required: true }) declare panelId: string

    get macrogroup() {
        return this.$store.getters['gui/macros/getMacrogroup'](this.panelId)
    }

    get allMacros() {
        return this.$store.getters['printer/getMacros'] ?? []
    }

    get macros() {
        let macros = this.macrogroup?.macros ?? []

        macros = macros.filter((macro: GuiMacrosStateMacrogroupMacro) => {
            if (
                !this.allMacros.find(
                    (existMacro: PrinterStateMacro) => existMacro.name.toLowerCase() === macro.name.toLowerCase()
                )
            )
                return false

            return (
                (macro.showInStandby && ['standby', 'cancelled', 'complete', 'error'].includes(this.printer_state)) ||
                (macro.showInPause && this.printer_state === 'paused') ||
                (macro.showInPrinting && this.printer_state === 'printing')
            )
        })

        return macros.sort((a: GuiMacrosStateMacrogroupMacro, b: GuiMacrosStateMacrogroupMacro) => a.pos - b.pos)
    }

    get macrogroupStatus() {
        return (
            (this.macrogroup.showInStandby &&
                ['standby', 'cancelled', 'complete', 'error'].includes(this.printer_state)) ||
            (this.macrogroup.showInPause && this.printer_state === 'paused') ||
            (this.macrogroup.showInPrinting && this.printer_state === 'printing')
        )
    }

    getColor(macro: GuiMacrosStateMacrogroupMacro) {
        if (macro.color === 'group') {
            if (this.macrogroup.color === 'custom') return this.macrogroup.colorCustom
            else return this.macrogroup.color
        }

        return macro.color
    }
}
</script>
