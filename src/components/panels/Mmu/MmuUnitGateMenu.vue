<template>
    <v-menu
        v-model="showContextMenu"
        transition="slide-y-transition"
        :position-x="menuX"
        :position-y="menuY"
        :close-on-content-click="false"
        absolute
        offset-y>
        <v-list dense @mouseleave="closeContextMenu">
            <v-subheader class="d-block text-subtitle-2 text-center mb-0 h-auto pb-2">
                {{ contextMenuHeader }}
            </v-subheader>
            <v-divider class="mb-2" />
            <mmu-unit-gate-menu-item
                v-for="(item, index) in contextMenuItems"
                :key="index"
                :item="item"
                :gate-index="gateIndex"
                @close-context-menu="closeContextMenu" />
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    MmuMachineUnit,
    TOOL_GATE_BYPASS,
    FILAMENT_POS_LOADED,
    MmuUnitGateContextMenuItem,
} from '@/components/mixins/mmu'
import { mdiSwapHorizontal, mdiDownloadOutline, mdiEject, mdiAxisArrow, mdiDatabaseEdit } from '@mdi/js'
import MmuUnitGateMenuItem from '@/components/panels/Mmu/MmuUnitGateMenuItem.vue'

@Component({
    components: { MmuUnitGateMenuItem },
})
export default class MmuUnitGateMenu extends Mixins(BaseMixin, MmuMixin) {
    @VModel({ type: Boolean }) showContextMenu!: boolean
    @Prop({ type: Number, required: true }) readonly gateIndex!: number
    @Prop({ required: true }) readonly mmuMachineUnit!: MmuMachineUnit | undefined
    @Prop({ type: Number, required: true }) readonly selectedGate!: number
    @Prop({ type: Number, required: true }) readonly menuX!: number
    @Prop({ type: Number, required: true }) readonly menuY!: number

    get gateName() {
        return this.gateIndex === TOOL_GATE_BYPASS ? 'Bypass' : this.gateIndex.toString()
    }

    get contextMenuHeader() {
        if (this.gateIndex >= 0) return `${this.$t('Panels.MmuPanel.Gate').toString()} ${this.gateIndex}`

        return this.gateName
    }

    get canCrossload() {
        return this.mmuMachineUnit?.can_crossload ?? false
    }

    get isLoaded() {
        return this.mmuFilamentPos === FILAMENT_POS_LOADED
    }

    get isSelectedGate() {
        return this.gateIndex === this.selectedGate
    }

    get contextMenuItems(): MmuUnitGateContextMenuItem[] {
        const items: MmuUnitGateContextMenuItem[] = [
            {
                icon: mdiSwapHorizontal,
                label: this.$t('Panels.MmuPanel.ButtonSelect').toString(),
                loading: '',
                action: { kind: 'call', fn: () => this.selectGate() },
                disabled: () => !this.canSend || this.isSelectedGate || this.printerIsPrintingOnly || this.isLoaded,
            },
            {
                icon: mdiDatabaseEdit,
                label: this.$t('Panels.MmuPanel.EditGateMap').toString(),
                loading: '',
                action: { kind: 'call', fn: () => this.editFilament() },
                disabled: () => false,
            },
            {
                icon: mdiDownloadOutline,
                label: this.$t('Panels.MmuPanel.ButtonPreload').toString(),
                loading: 'mmu_preload',
                action: { kind: 'gcode', command: 'MMU_PRELOAD' },
                disabled: () =>
                    !this.canSend ||
                    (!this.isSelectedGate && !this.canCrossload) ||
                    (this.isSelectedGate && this.isLoaded),
            },
            {
                icon: mdiEject,
                label: this.$t('Panels.MmuPanel.ButtonEject').toString(),
                loading: 'mmu_eject',
                action: { kind: 'gcode', command: 'MMU_EJECT' },
                disabled: () => !this.canSend || (this.gateIndex !== this.selectedGate && !this.canCrossload),
            },
            {
                icon: mdiAxisArrow,
                label: this.$t('Panels.MmuPanel.ButtonChangeTool').toString(),
                loading: 'mmu_change_tool',
                action: { kind: 'gcode', command: 'MMU_CHANGE_TOOL' },
                disabled: () => !this.canSend || this.isSelectedGate || this.printerIsPrintingOnly,
            },
        ]

        if (this.gateIndex < 0) return items.slice(0, 1)

        return items
    }

    closeContextMenu() {
        this.showContextMenu = false
    }

    editFilament() {
        this.$emit('edit-filament', this.gateIndex)
    }

    selectGate() {
        this.$emit('select-gate', this.gateIndex)
    }
}
</script>
