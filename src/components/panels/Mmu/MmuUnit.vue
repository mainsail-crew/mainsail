<template>
    <div class="mmu-unit d-inline-flex flex-column mx-1 rounded-lg mb-3">
        <div class="d-flex flex-wrap pt-3 px-4 position-relative">
            <mmu-unit-gate
                v-for="(gateIndex, idx) in numGates"
                :key="gateIndex"
                :gate-index="gateIndex - 1 + firstGateNumber"
                :mmu-machine-unit="mmuMachineUnit"
                :show-details="showDetails"
                :show-context-menu="showContextMenu"
                :unhighlight-spools="unhighlightSpools"
                :selected-gate="selectedGate"
                :gate-pos="gatePos(idx)"
                @select-gate="selectGate" />
            <mmu-unit-gate
                v-if="hasBypass"
                :gate-index="TOOL_GATE_BYPASS"
                :mmu-machine-unit="mmuMachineUnit"
                :show-context-menu="false"
                :selected-gate="selectedGate"
                gate-pos="R"
                @select-gate="selectGate" />
        </div>
        <mmu-unit-footer class="pt-0 position-relative" :mmu-machine-unit="mmuMachineUnit" :unit-index="unitIndex" />
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
    @Prop({ default: false }) readonly showContextMenu!: boolean
    @Prop({ default: false }) readonly hideBypass!: boolean
    @Prop({ default: false }) readonly unhighlightSpools!: boolean

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

    gatePos(idx: number) {
        return idx === 0 ? 'L' : idx === this.numGates - 1 && !this.hasBypass ? 'R' : ''
    }

    selectGate(gateIndex: number) {
        this.$emit('select-gate', gateIndex)
    }
}
</script>

<style scoped>
.mmu-unit {
    background: #2c2c2c;
    overflow: hidden;
}

html.theme--light .mmu-unit {
    background: #f0f0f0;
}
</style>
