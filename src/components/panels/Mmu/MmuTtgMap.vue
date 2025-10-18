<template>
    <svg
        ref="ttgMap"
        :viewBox="viewbox"
        preserveAspectRatio="xMidYMid meet"
        class="cursor-pointer"
        @click="$emit('click')">
        <defs>
            <marker
                id="squareStart"
                fill="context-stroke"
                markerWidth="7"
                markerHeight="7"
                refX="7"
                refY="3.5"
                orient="auto"
                markerUnits="userSpaceOnUse">
                <rect x="0" y="0" width="7" height="7" stroke-width="2" />
            </marker>
            <marker
                id="arrowEnd"
                fill="context-stroke"
                markerWidth="7"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
                markerUnits="userSpaceOnUse">
                <polygon points="0 0, 7 3.5, 0 7" stroke-width="1" />
            </marker>
        </defs>

        <g v-for="tool in toolsArray" :key="tool">
            <mmu-ttg-map-tool :tool="tool" :selected-tool="selectedTool" />
            <mmu-ttg-map-gate :gate="tool" :selected-gate="selectedGate" :gate-x="gateX" />
            <mmu-ttg-map-line :tool="tool" :selected-tool="selectedTool" />
        </g>

        <mmu-ttg-map-group
            v-for="(group, index) in printGroups"
            :key="'group_' + index"
            :group="group"
            :current-group="currentGroup"
            :index="index"
            :gate-x="gateX"
            :group-x="groupX" />
    </svg>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    GATE_UNKNOWN,
    MmuTtgMap_START_X,
    MmuTtgMap_START_Y,
    MmuTtgMap_VERTICAL_SPACING,
    MmuTtgMap_GROUP_SPACING,
    MmuTtgMap_MAP_SPACE,
    MmuTtgMap_LEADER,
    TOOL_GATE_UNKNOWN,
} from '@/components/mixins/mmu'
import MmuTtgMapGate from '@/components/panels/Mmu/MmuTtgMapGate.vue'
import MmuTtgMapGroup from '@/components/panels/Mmu/MmuTtgMapGroup.vue'

@Component({
    components: { MmuTtgMapGroup, MmuTtgMapGate },
})
export default class MmuTtgMap extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ default: TOOL_GATE_UNKNOWN }) readonly selectedTool!: number
    @Prop({ default: GATE_UNKNOWN }) readonly selectedGate!: number
    @Prop({ default: null }) readonly filteredTtgMap!: { tool: number; gate: number }[] | null

    get gateX() {
        return MmuTtgMap_START_X + MmuTtgMap_LEADER + MmuTtgMap_MAP_SPACE + MmuTtgMap_LEADER + 40
    }

    get groupX() {
        const xOffset = 10 // extra space between gates and groups

        return this.gateX + xOffset
    }

    get width() {
        return this.groupX + Object.keys(this.printGroups).length * MmuTtgMap_GROUP_SPACING // Single gate groups aren't displayed
    }

    get height() {
        return MmuTtgMap_START_Y + this.numGates * MmuTtgMap_VERTICAL_SPACING + 6
    }

    get viewbox() {
        return `0 0 ${this.width} ${this.height}`
    }

    get toolsArray() {
        const array = []

        for (let tool = 0; tool < this.numGates; tool++) {
            if (tool === this.selectedTool) continue
            if (this.filteredTtgMap !== null && !this.filteredTtgMap?.some((map) => map.tool === tool)) continue

            array.push(tool)
        }

        // add selected tool at the end, because of the svg layering (last drawn is on top)
        if (this.selectedTool !== TOOL_GATE_UNKNOWN) {
            array.push(this.selectedTool)
        }

        return array
    }

    get groups() {
        return this.mmu?.endless_spool_groups ?? []
    }

    get currentGroup() {
        if (this.selectedGate >= 0 && this.selectedGate < this.groups.length) {
            return this.groups[this.selectedGate]
        }

        return -1
    }

    get printGroups() {
        if (this.filteredTtgMap !== null && this.filteredTtgMap?.length !== this.numGates) return []

        const groups: { [key: number]: number[] } = {}
        this.groups.forEach((group, index) => {
            if (!groups[group]) {
                groups[group] = []
            }

            groups[group].push(index)
        })

        // convert to array
        const result: number[][] = []
        Object.keys(groups).forEach((key) => {
            result.push(groups[+key])
        })

        return result.filter((group) => group.length > 1)
    }
}
</script>
