<template>
    <svg ref="mmuGateStatusSvg" viewBox="0 0 120 60" xml:space="preserve" preserveAspectRatio="xMidYMid meet">
        <rect
            x="20"
            y="16"
            width="80"
            height="35"
            rx="8"
            ry="8"
            stroke-width="4"
            :stroke="statusColor"
            :fill="selectedColor" />
        <text
            v-if="gateIndex >= 0"
            x="60"
            y="44"
            text-anchor="middle"
            font-weight="bold"
            font-size="30px"
            :fill="textColor">
            {{ gateIndex }}
        </text>
        <text
            v-if="gateIndex === TOOL_GATE_BYPASS"
            x="60"
            y="41"
            text-anchor="middle"
            font-weight="bold"
            font-size="20px"
            :fill="textColor">
            BYPASS
        </text>
    </svg>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'

@Component({})
export default class MmuGateStatus extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) declare readonly gateIndex!: number
    @Prop({ required: false, default: null }) readonly editGateMap!: MmuGateDetails[] | null
    @Prop({ required: false, default: -1 }) readonly editGateSelected!: number

    get statusColor(): string {
        if (this.gateIndex < 0) return 'none'

        let status = this.gateStatus[this.gateIndex]
        if (this.editGateMap) status = this.editGateMap[this.gateIndex].status

        if (status >= 1) {
            return 'green'
        } else if (status === 0) {
            return '#808080'
        }
        return 'orange' // Unknown
    }

    get selectedColor(): string {
        if (this.editGateMap) return 'none'

        if (this.gate === this.gateIndex) {
            return 'limegreen'
        } else {
            return 'none'
        }
    }

    get textColor(): string {
        if (!this.editGateMap && this.gate === this.gateIndex) {
            return '#000000'
        } else {
            if (this.$vuetify.theme.dark) {
                return '#c0c0c0'
            } else {
                return '#5d5d5d'
            }
        }
    }
}
</script>

<style scoped></style>
