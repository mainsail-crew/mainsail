<template>
    <text :x="positionX" :y="positionY" text-anchor="end" :fill="fill" font-size="10px" :font-weight="fontWeight">
        {{ name }}
    </text>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    MmuTtgMap_START_X,
    MmuTtgMap_START_Y,
    MmuTtgMap_VERTICAL_SPACING,
    TOOL_GATE_UNKNOWN,
} from '@/components/mixins/mmu'

@Component
export default class MmuTtgMapTool extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly tool!: number
    @Prop({ default: TOOL_GATE_UNKNOWN }) readonly selectedTool!: number

    get name() {
        return `T${this.tool}`
    }

    get positionX() {
        return MmuTtgMap_START_X + 14
    }

    get positionY() {
        return this.tool * MmuTtgMap_VERTICAL_SPACING + MmuTtgMap_START_Y + 8
    }

    get fill() {
        return this.tool === this.selectedTool ? 'var(--v-primary-lighten1, #2CA9BC)' : 'currentColor'
    }

    get fontWeight() {
        return this.tool === this.selectedTool ? 'bold' : 'inherit'
    }
}
</script>
