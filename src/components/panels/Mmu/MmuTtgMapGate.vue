<template>
    <text :x="gateX" :y="positionY" text-anchor="end" :fill="fill" font-size="10px" :font-weight="fontWeight">
        {{ name }}
    </text>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { GATE_UNKNOWN, MmuTtgMap_START_Y, MmuTtgMap_VERTICAL_SPACING } from '@/components/mixins/mmu'

@Component
export default class MmuTtgMapGate extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly gate!: number
    @Prop({ required: true }) readonly gateX!: number
    @Prop({ default: GATE_UNKNOWN }) readonly selectedGate!: number

    get name() {
        return `#${this.gate}`
    }

    get positionY() {
        return this.gate * MmuTtgMap_VERTICAL_SPACING + MmuTtgMap_START_Y + 8
    }

    get fill() {
        return this.gate === this.selectedGate ? 'var(--v-primary-lighten1, #2CA9BC)' : 'currentColor'
    }

    get fontWeight() {
        return this.gate === this.selectedGate ? 'bold' : 'inherit'
    }
}
</script>
