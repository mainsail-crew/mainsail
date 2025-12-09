<template>
    <div>
        <h3 class="text-h5 mb-3 mt-5">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Config') }}</h3>

        <settings-row
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.TxMacroColor')"
            :sub-title="$t('Panels.MmuPanel.MmuMaintenanceDialog.TxMacroColorDescription')"
            dense>
            <v-select v-model="configTMacroColor" :items="tMacroColorOptions" hide-details outlined dense />
        </settings-row>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'

@Component
export default class MmuMaintenanceStateDialogLeds extends Mixins(BaseMixin, MmuMixin) {
    get configTMacroColor() {
        return this.mmuSettings?.t_macro_color ?? 'slicer'
    }

    set configTMacroColor(newVal: string) {
        this.doSend(`MMU_TEST_CONFIG QUIET=1 t_macro_color=${newVal}`)
    }

    get tMacroColorOptions() {
        return [
            { value: 'slicer', text: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.TMacroColorOptions.Slicer') },
            { value: 'allgates', text: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.TMacroColorOptions.AllGates') },
            { value: 'gatemap', text: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.TMacroColorOptions.GateMap') },
            { value: 'off', text: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.TMacroColorOptions.Off') },
        ]
    }
}
</script>
