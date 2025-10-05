<template>
    <div class="d-flex flex-column align-center">
        <mmu-unit-gate-spool
            class="position-relative zindex-1"
            :gate-index="gateIndex"
            :show-details="showDetails"
            :is-selected="isSelected"
            @select-gate="selectGate" />

        <span class="gate-number rounded cursor-pointer" :class="gateNumberClass" @click="selectGate">
            {{ gateName }}
        </span>
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { MmuMachineUnit, TOOL_GATE_BYPASS } from '@/components/mixins/mmu'

@Component
export default class MmuUnitGate extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly gateIndex!: number
    @Prop({ required: true }) readonly mmuMachineUnit!: MmuMachineUnit
    @Prop({ default: false }) readonly showDetails!: boolean
    @Prop({ required: true }) readonly selectedGate!: number

    get gateName() {
        if (this.gateIndex === TOOL_GATE_BYPASS) return 'Bypass'

        return this.gateIndex
    }

    get gateStatus() {
        return this.mmu?.gate_status[this.gateIndex] ?? 0
    }

    get gateNumberClass() {
        return {
            active: this.isSelected,
            'border-unknown': this.gateStatus < 0,
            'border-active': this.gateStatus > 0,
            bypass: this.gateIndex === TOOL_GATE_BYPASS,
        }
    }

    get isSelected() {
        return this.selectedGate === this.gateIndex
    }

    selectGate() {
        this.$emit('select-gate', this.gateIndex)
    }
}
</script>

<style scoped>
.zindex-1 {
    z-index: 1;
}

.gate-number {
    border: 2px solid #808080;
    width: 80%;
    position: relative;
    z-index: 4;
    text-align: center;
    color: #c0c0c0;
    font-weight: bold;
    line-height: 16px;
    font-size: 14px;
}

html.theme--light .gate-number {
    color: #5d5d5d;
}

.gate-number.active {
    color: #000000;
    background-color: limegreen;
}

.gate-number.bypass {
    font-size: 10px;
    text-transform: uppercase;
    width: 90%;
    border-color: transparent !important;
}

.gate-number.border-active {
    border-color: green;
}

.gate-number.border-unknown {
    border-color: orange;
}
</style>
