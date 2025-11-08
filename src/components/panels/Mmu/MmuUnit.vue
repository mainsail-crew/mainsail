<template>
    <div class="mmu-unit d-inline-flex flex-column mx-1 rounded-lg mb-3">
        <div class="d-flex pt-3 px-4 mb-n7 position-relative">
            <mmu-unit-gate
                v-for="gateIndex in mmuNumGates"
                :key="gateIndex"
                :gate-index="gateIndex - 1 + firstGateNumber"
                :mmu-machine-unit="mmuMachineUnit"
                :show-details="showDetails"
                :unhighlight-spools="unhighlightSpools"
                :selected-gate="selectedGate"
                @select-gate="selectGate" />
            <mmu-unit-gate
                v-if="hasBypass"
                :gate-index="TOOL_GATE_BYPASS"
                :mmu-machine-unit="mmuMachineUnit"
                :selected-gate="selectedGate"
                @select-gate="selectGate" />
        </div>
        <mmu-unit-footer
            class="pt-8 position-relative zindex-3"
            :mmu-machine-unit="mmuMachineUnit"
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
    @Prop({ default: false }) readonly hideBypass!: boolean
    @Prop({ default: false }) readonly unhighlightSpools!: boolean

    get mmuMachineUnit() {
        return this.getMmuMachineUnit(this.unitIndex)
    }

    get firstGateNumber() {
        return this.mmuMachineUnit?.first_gate ?? 0
    }

    get hasBypass() {
        if (this.hideBypass) return false

        return this.mmuMachineUnit?.has_bypass ?? true
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

.zindex-3 {
    z-index: 3;
}
</style>
