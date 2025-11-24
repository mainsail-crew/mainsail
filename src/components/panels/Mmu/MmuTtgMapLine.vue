<template>
    <path
        :d="path"
        :stroke-width="strokeWidth"
        :class="pathClass"
        fill="none"
        marker-start="url(#squareStart)"
        marker-end="url(#arrowEnd)" />
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    MmuTtgMap_LEADER,
    MmuTtgMap_MAP_SPACE,
    MmuTtgMap_START_X,
    MmuTtgMap_START_Y,
    MmuTtgMap_VERTICAL_SPACING,
    TOOL_GATE_UNKNOWN,
} from '@/components/mixins/mmu'

@Component
export default class MmuTtgMapLine extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly tool!: number
    @Prop({ default: TOOL_GATE_UNKNOWN }) readonly selectedTool!: number

    get gate() {
        return this.ttgMap[this.tool] ?? TOOL_GATE_UNKNOWN
    }

    get pathClass() {
        if (this.tool === this.selectedTool) {
            return 'stroke-selected-color'
        }

        return 'stroke-regular-color'
    }

    get strokeWidth() {
        if (this.tool === this.selectedTool) {
            return 4
        }

        return 2
    }

    get path() {
        const xOffset = 28 // offset between tool number and line start
        const yOffset = 4 // to center the line vertically

        const x1 = MmuTtgMap_START_X + xOffset
        const y1 = MmuTtgMap_START_Y + this.tool * MmuTtgMap_VERTICAL_SPACING + yOffset
        const tX = x1 + MmuTtgMap_LEADER
        const gX = tX + MmuTtgMap_MAP_SPACE

        return (
            `M ${x1} ${y1} ` +
            `L ${tX} ${y1} ` +
            `L ${gX - MmuTtgMap_LEADER} ${MmuTtgMap_START_Y + this.gate * MmuTtgMap_VERTICAL_SPACING + yOffset} ` +
            `L ${gX} ${MmuTtgMap_START_Y + this.gate * MmuTtgMap_VERTICAL_SPACING + yOffset}`
        )
    }
}
</script>

<style scoped>
.stroke-regular-color {
    stroke: var(--v-secondary-lighten2, #808080);
}
.stroke-selected-color {
    stroke: var(--v-primary-lighten1, #2ca9bc);
}
</style>
