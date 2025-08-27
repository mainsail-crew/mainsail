<template>
    <svg
        ref="clogMeter"
        viewBox="0 0 140 140"
        preserveAspectRatio="xMidYMid meet"
        :class="{ 'disabled-clog': encoderDetectionMode === 0 || encoderEnabled === false }">
        <g transform="rotate(120 70 70)">
            <circle
                cx="70"
                cy="70"
                r="50"
                class="v-progress-circular__underlay"
                fill="transparent"
                stroke-width="18"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dialArc"></circle>
            <circle
                ref="dialCircle"
                cx="70"
                cy="70"
                r="50"
                class="primary-color"
                fill="transparent"
                stroke-width="18"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset" />
        </g>
        <g :transform="'rotate(' + headroomRotate + ' 70 70)'">
            <circle
                cx="70"
                cy="70"
                r="50"
                class="warning-color"
                fill="transparent"
                stroke-width="18"
                opacity="0.4"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="headroomArc" />
        </g>

        <line
            ref="minHeadroomLine"
            :x1="x1MinHeadroom"
            :y1="y1MinHeadroom"
            x2="70"
            y2="70"
            :class="{ 'warning-color': headroomWarning, 'primary-color': !headroomWarning }"
            stroke-width="4"
            stroke-dashoffset="0"
            stroke-dasharray="25,65" />
        <line
            :x1="x1Start"
            :y1="y1Start"
            x2="70"
            y2="70"
            stroke="white"
            stroke-width="2"
            stroke-dashoffset="0"
            stroke-dasharray="24,65" />
        <line
            :x1="x1End"
            :y1="y1End"
            x2="70"
            y2="70"
            class="warning-color"
            stroke-width="2"
            stroke-dashoffset="0"
            stroke-dasharray="24,65" />

        <text x="70" y="56" text-anchor="middle" class="small-text-color" font-size="11px">FLOW</text>
        <text x="70" y="80" text-anchor="middle" class="small-text-color" font-size="20px">{{ encoderFlowRate }}%</text>
        <text
            v-if="encoderDetectionMode === 2"
            x="70"
            y="124"
            text-anchor="middle"
            class="small-text-color"
            font-size="12px">
            Auto
        </text>
        <text x="30" y="136" text-anchor="end" class="small-text-color" font-size="12px">
            {{ encoderDetectionLength }}
        </text>
        <text x="108" y="136" class="small-text-color" font-size="12px">0</text>
    </svg>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'

@Component({})
export default class MmuClogMeter extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ default: 1 }) readonly rotationTime!: number

    private circumference: number = 2 * Math.PI * 50
    private dialArc: number = this.circumference * (60 / 360)
    private dashOffset: number = this.circumference

    private x1Start: number = 70 + 65 * Math.cos((120 * Math.PI) / 180)
    private y1Start: number = 70 + 65 * Math.sin((120 * Math.PI) / 180)
    private x1End: number = 70 + 65 * Math.cos((60 * Math.PI) / 180)
    private y1End: number = 70 + 65 * Math.sin((60 * Math.PI) / 180)

    x1MinHeadroom: number = 70 + 66 * Math.cos(((120 + 0) * Math.PI) / 180)
    y1MinHeadroom: number = 70 + 66 * Math.sin(((120 + 0) * Math.PI) / 180)
    headroomWarning: boolean = false

    get headroomArc(): number {
        return this.circumference * (1 - (this.encoderDesiredHeadroom / this.encoderDetectionLength) * (300 / 360))
    }

    get headroomRotate(): number {
        return 420 - (this.encoderDesiredHeadroom / this.encoderDetectionLength) * 300
    }

    @Watch('$store.state.printer.mmu.encoder.headroom')
    onHeadroomChanged(newHeadroom: number): void {
        const clogPercent =
            (Math.min(Math.max(0, this.encoderDetectionLength - newHeadroom), this.encoderDetectionLength) /
                this.encoderDetectionLength) *
            100
        const offset = ((100 - (clogPercent * 300) / 360) / 100) * this.circumference
        this.animateMeter(offset)
    }

    @Watch('$store.state.printer.mmu.encoder.min_headroom')
    onMinHeadroomChanged(newMinHeadroom: number): void {
        const clogPercent =
            (Math.min(Math.max(0, this.encoderDetectionLength - newMinHeadroom), this.encoderDetectionLength) /
                this.encoderDetectionLength) *
            100
        const angle = clogPercent * 3
        this.x1MinHeadroom = 70 + 66 * Math.cos(((120 + angle) * Math.PI) / 180)
        this.y1MinHeadroom = 70 + 66 * Math.sin(((120 + angle) * Math.PI) / 180)
        this.headroomWarning = newMinHeadroom < this.encoderDesiredHeadroom
    }

    private animateMeter(newOffset: number) {
        const circle = this.$refs.dialCircle as SVGElement
        const currentOffset = parseFloat(getComputedStyle(circle).strokeDashoffset) ?? this.circumference
        const difference = Math.abs(currentOffset - newOffset)
        const duration = (difference / this.circumference) * this.rotationTime
        circle.style.transition = `stroke-dashoffset ${duration}s ease-out`
        this.dashOffset = newOffset
    }
}
</script>

<style scoped>
.disabled-clog {
    opacity: 0.5;
    cursor: not-allowed;
}
.primary-color {
    stroke: var(--v-primary-lighten1, #2ca9bc);
}
.warning-color {
    stroke: var(--v-error-base, #ff0000);
}
.small-text-color {
    fill: var(--v-primary-lighten1, #2ca9bc);
}
</style>
