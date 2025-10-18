<template>
    <g>
        <path :d="path" stroke-width="2" stroke-linecap="round" :class="elementClass" fill="none" />
        <text :x="textPositionX" :y="textPositionY" :class="elementClass" font-size="8px">
            {{ groupChar }}
        </text>
    </g>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    MmuTtgMap_GROUP_SPACING,
    MmuTtgMap_START_Y,
    MmuTtgMap_VERTICAL_SPACING,
} from '@/components/mixins/mmu'

@Component
export default class MmuTtgMapLine extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly group!: number[]
    @Prop({ required: true }) readonly index!: number
    @Prop({ required: true }) readonly gateX!: number
    @Prop({ required: true }) readonly groupX!: number
    @Prop({ default: -1 }) readonly currentGroup!: number

    get textPositionX() {
        return this.groupX + this.index * MmuTtgMap_GROUP_SPACING
    }

    get textPositionY() {
        return MmuTtgMap_START_Y + this.numGates * MmuTtgMap_VERTICAL_SPACING + 2
    }

    get path() {
        const tick = 5 // length of the horizontal tick
        const y1 = MmuTtgMap_START_Y + 4 // small offset to align with gate lines

        const paths: string[] = []
        let y0: number | null = null

        this.group.forEach((gate) => {
            const y = y1 + gate * MmuTtgMap_VERTICAL_SPACING
            paths.push(`M ${this.textPositionX + tick} ${y} L ${this.textPositionX} ${y}`)
            if (y0 !== null) {
                paths.push(`M ${this.textPositionX + tick} ${y0} L ${this.textPositionX + tick} ${y}`)
            }
            y0 = y
        })

        return paths.join(' ')
    }

    get groupChar() {
        return String.fromCharCode(this.index + 65)
    }

    get elementClass() {
        return this.index === this.currentGroup ? 'selected' : 'regular'
    }
}
</script>

<style scoped>
.regular {
    stroke: var(--v-secondary-lighten2, #808080);
    fill: var(--v-secondary-lighten2, #808080);
    font-weight: normal;
}
.selected {
    stroke: var(--v-primary-lighten1, #2ca9bc);
    fill: var(--v-primary-lighten1, #2ca9bc);
    font-weight: bold;
}
</style>
