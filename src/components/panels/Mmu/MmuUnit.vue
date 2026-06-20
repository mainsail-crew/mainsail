<template>
    <div :class="mmuUnitClass" class="d-inline-flex flex-column mx-1 mb-3">
        <div class="d-flex flex-wrap pt-3 px-4 position-relative">
            <mmu-unit-gate
                v-for="gateIndex in numGates"
                :key="gateIndex"
                :gate-index="gateIndex - 1 + firstGateNumber"
                :mmu-machine-unit="mmuMachineUnit"
                :show-details="showDetails"
                :show-context-menu="showContextMenu"
                :unhighlight-spools="unhighlightSpools"
                :selected-gate="selectedGate"
                :has-bypass="hasBypass"
                @edit-filament="editFilament"
                @select-gate="selectGate" />
            <mmu-unit-gate
                v-if="hasBypass"
                :gate-index="TOOL_GATE_BYPASS"
                :mmu-machine-unit="mmuMachineUnit"
                :show-context-menu="showContextMenu"
                :selected-gate="selectedGate"
                @select-gate="selectGate" />
        </div>
        <mmu-unit-footer
            class="pt-0 position-relative"
            :style="footerStyle"
            :mmu-machine-unit="mmuMachineUnit"
            :show-details="showDetails"
            :show-footer="showFooter"
            :unit-index="unitIndex" />
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { TOOL_GATE_BYPASS } from '@/components/mixins/mmu'

@Component
export default class MmuUnit extends Mixins(BaseMixin, MmuMixin) {
    TOOL_GATE_BYPASS = TOOL_GATE_BYPASS

    @Prop({ required: true }) readonly selectedGate!: number
    @Prop({ required: true }) readonly unitIndex!: number
    @Prop({ default: false }) readonly showDetails!: boolean
    @Prop({ default: true }) readonly showContextMenu!: boolean
    @Prop({ default: true }) readonly showFooter!: boolean
    @Prop({ default: false }) readonly hideBypass!: boolean
    @Prop({ default: false }) readonly unhighlightSpools!: boolean

    get mmuUnitClass() {
        if (this.unitIndex < 0) return 'mmu-unit-clear mmu-unit'
        return 'mmu-unit'
    }

    get mmuMachineUnit() {
        return this.getMmuMachineUnit(this.unitIndex)
    }

    get numGates() {
        return this.mmuMachineUnit?.num_gates ?? 0
    }

    get firstGateNumber() {
        return this.mmuMachineUnit?.first_gate ?? 0
    }

    get hasBypass() {
        if (this.hideBypass) return false

        return this.mmuMachineUnit?.has_bypass ?? true
    }

    editFilament(gateIndex: number) {
        this.$emit('edit-filament', gateIndex)
    }

    selectGate(gateIndex: number) {
        this.$emit('select-gate', gateIndex)
    }

    get footerStyle() {
        const numSpools = this.numGates + (this.hasBypass ? 1 : 0)
        const maxWidth = this.spoolWidth * numSpools + 32
        return `max-width: ${maxWidth}px;`
    }
}
</script>

<style scoped>
.mmu-unit-clear {
    background: none !important;
    box-shadow: none !important;
}

.mmu-unit {
    background: #2c2c2c;
    overflow: hidden;
    border-radius: 32px 32px 8px 8px;
    box-shadow: inset 0px 4px 4px -4px #ffffff80;
}

html.theme--light .mmu-unit {
    background: #f0f0f0;
    box-shadow: inset 0px 4px 2px -4px #2c2c2c80;
}
</style>
