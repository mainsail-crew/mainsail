<template>
    <svg ref="mmuSpoolSvg" viewBox="0 0 248 500" preserveAspectRatio="xMidYMid meet">
        <defs>
            <path
                id="oval"
                d="M 0 -63 C 35 -63 63 -35 63 0 C 63 35 35 63 0 63 C -35 63 -63 35 -63 0 C -63 -35 -35 -63 0 -63 z"
                vector-effect="non-scaling-stroke" />
            <path
                id="center"
                d="M 0 -63 C 35 -63 63 -35 63 0 C 63 35 35 63 0 63 L -624 63 L -624 -63 z"
                vector-effect="non-scaling-stroke" />
            <path
                id="espool"
                d="M 89.561 35.5 L 60.333 15.734 c -0.308 -0.208 -0.704 -0.229 -1.029 -0.055 c -0.327 0.173 -0.531 0.513 -0.531 0.883 v 7.987 c -12.038 0.262 -26.306 5.201 -37.501 13.023 C 7.554 47.155 0 59.894 0 73.438 c 0 0.471 0.329 0.878 0.79 0.978 C 0.86 74.432 0.931 74.438 1 74.438 c 0.386 0 0.747 -0.225 0.911 -0.588 c 7.823 -17.312 26.952 -26.183 56.861 -26.376 v 8.62 c 0 0.37 0.204 0.71 0.531 0.883 c 0.325 0.173 0.722 0.153 1.029 -0.055 l 29.228 -19.766 C 89.835 36.971 90 36.661 90 36.329 S 89.835 35.686 89.561 35.5 z"
                stroke-width="2"
                stroke="#CCCCCC"
                fill="#808080"
                opacity="0.7" />
        </defs>

        <filter id="blur_wheel2" width="1.3" height="1.16">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="18" dy="0" result="oBlur" />
            <feFlood flood-color="#000" flood-opacity=".67" />
            <feComposite in2="oBlur" operator="in" />
            <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
        <g transform="matrix(0.59,0,0,3.95,197,250)">
            <use href="#oval" style="filter: url(#blur_wheel2)" :fill="spoolWheelColor" />
            <use href="#oval" transform="scale(0.41)" style="filter: url(#blur_wheel2)" :fill="spoolWheelColor" />
            <use href="#center" transform="scale(0.41)" :fill="spoolWheelColor" />
        </g>
        <path
            v-if="filamentAmount !== 0 || details.status !== GATE_EMPTY"
            ref="filament"
            d="M 0 -63 C 35 -63 63 -35 63 0 C 63 35 35 63 0 63 L -424 63 L -424 -63 z"
            vector-effect="non-scaling-stroke"
            :fill="filamentColor"
            :transform="'matrix(' + computedScale(0.28, 0.4) + ',0,0,' + computedScale(1.65, 3.5) + ',197,250)'" />
        <g transform="matrix(0.59,0,0,3.95,37,250)">
            <use href="#oval" style="filter: url(#blur_wheel2)" :fill="spoolWheelColor" />
            <use href="#oval" transform="scale(0.41)" style="fill: #111111" />
        </g>

        <g v-if="!editGateMap">
            <text
                v-if="filamentAmount > 0"
                x="152"
                y="270"
                text-anchor="middle"
                font-weight="bold"
                font-size="56px"
                :fill="contrastColor">
                {{ filamentAmount }}%
            </text>
            <text
                v-else-if="filamentAmount === 0 && details.status !== GATE_EMPTY"
                x="140"
                y="310"
                text-anchor="middle"
                font-weight="bold"
                font-size="160px"
                style="fill: red; stroke: #111111; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round">
                !
            </text>
            <use
                v-if="espoolerActive === 'rewind' && gateIndex === gate"
                href="#espool"
                transform="translate(225,0) rotate(90) scale(2,2)" />
            <use
                v-if="espoolerActive === 'assist' && gateIndex === gate"
                href="#espool"
                transform="translate(225,500) rotate(270) scale(2,-2)" />
        </g>
    </svg>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import type { MmuGateDetails } from '@/store/mmu/types'

@Component({})
export default class MmuSpool extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true, default: -1 }) declare readonly gateIndex: number
    @Prop({ required: false, default: '#AD8762' }) declare readonly spoolWheelColor: string
    @Prop({ required: false, default: null }) readonly editGateMap!: MmuGateDetails[] | null
    @Prop({ required: false, default: -1 }) declare readonly editGateSelected: number

    contrastColor: string = 'black'

    get details(): MmuGateDetails {
        if (this.editGateMap) return this.editGateMap[this.gateIndex]
        return this.gateDetails(this.gateIndex)
    }

    get showUnavailableSpoolColor(): boolean {
        return this.$store.state.gui.view.mmu.showUnavailableSpoolColor ?? false
    }

    get filamentAmount(): number {
        if (this.editGateMap) return 100
        if (
            this.details.status === this.GATE_EMPTY &&
            !(this.showUnavailableSpoolColor && this.details.color !== this.NO_FILAMENT_COLOR)
        )
            return 0

        const spoolmanSpool = this.spoolmanSpool(this.details.spoolId)
        if (!spoolmanSpool) return -1

        if (!this.details.spoolId || this.details.spoolId <= 0 || this.spoolmanSupport === 'off') return -1

        // Pull live from spoolman and calculate percentage
        const remaining = spoolmanSpool?.remaining_weight ?? null
        const total = spoolmanSpool?.initial_weight ?? spoolmanSpool?.filament?.weight ?? null
        if (remaining === null || total === null) return -1
        return Math.ceil(Math.max(0, Math.min(100, (remaining / total) * 100)))
    }

    get filamentColor(): string {
        // Need spool to be rendered first
        this.$nextTick(() => {
            this.computeContrastColor()
        })
        return this.details.color
    }

    computedScale(start: number, end: number) {
        if (this.editGateMap || this.filamentAmount < 0) return end
        return start + (end - start) * (this.filamentAmount / 100)
    }

    computeContrastColor() {
        const filamentRef = this.$refs.filament as Element
        if (!filamentRef) {
            this.contrastColor = 'black'
            return
        }

        const fillColor = window.getComputedStyle(filamentRef).fill
        const rgbaMatch = fillColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)

        if (rgbaMatch) {
            const [r, g, b] = rgbaMatch.slice(1, 4).map(Number)
            const luminance = this.getLuminance({ r, g, b })
            this.contrastColor = luminance > 0.5 ? 'black' : 'white'
        } else {
            this.contrastColor = 'black'
        }
    }

    mounted() {
        this.computeContrastColor()
    }
}
</script>

<style scoped></style>
