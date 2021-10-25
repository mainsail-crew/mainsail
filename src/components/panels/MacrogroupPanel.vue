<style lang="scss" scoped>

</style>

<template>
    <panel
        v-if="klipperReadyForGui && macros.length > 0 && macrogroupStatus"
        icon="mdi-code-tags"
        :title="macrogroup.name"
        :collapsible="true"
        :card-class="'macrogroup_'+panelId+'_panel'"
    >
        <v-card-text class="py-2">
            <v-row>
                <v-col class="text-center">
                    <macro-button v-for="(macro, index) in macros"
                        :key="index"
                        :macro="macro"
                        :color="getColor(macro)"
                        class="mx-1 my-1"
                    />
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import {GuiStateMacrogroupMacros} from '@/store/gui/types'
import MacroButton from '@/components/inputs/MacroButton.vue'
@Component({
    components: {MacroButton, Panel}
})
export default class MacrogroupPanel extends Mixins(BaseMixin) {

    @Prop({ required: true }) panelId!: string

    get macrogroup() {
        return this.$store.getters['gui/getMacroGroup'](this.panelId)
    }

    get macros() {
        let macros = this.macrogroup.macros ?? []
        macros = macros.filter((macro: GuiStateMacrogroupMacros) => {
            return (
                (macro.showInStandby && ['standby', 'complete', 'error'].includes(this.printer_state)) ||
                (macro.showInPause && this.printer_state === 'paused') ||
                (macro.showInPrinting && this.printer_state === 'printing')
            )
        })

        return macros.sort((a: GuiStateMacrogroupMacros, b: GuiStateMacrogroupMacros) => a.pos - b.pos)
    }

    get macrogroupStatus() {
        return (
            (this.macrogroup.showInStandby && ['standby', 'complete', 'error'].includes(this.printer_state)) ||
            (this.macrogroup.showInPause && this.printer_state === 'paused') ||
            (this.macrogroup.showInPrinting && this.printer_state === 'printing')
        )
    }

    getColor(macro: GuiStateMacrogroupMacros) {
        if (macro.color === 'group') {
            if (this.macrogroup.color === 'custom') return this.macrogroup.colorCustom
            else return this.macrogroup.color
        }

        return macro.color
    }
}
</script>
