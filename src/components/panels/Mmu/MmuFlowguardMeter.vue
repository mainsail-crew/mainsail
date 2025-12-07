<template>
    <svg ref="flowguardMeter" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" :class="svgClasses">
        <g transform="rotate(120 70 70)">
            <circle
                cx="70"
                cy="70"
                r="50"
                class="v-progress-circular__underlay"
                fill="transparent"
                stroke-width="18"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="DIAL_ARC" />
        </g>
        <g transform="rotate(270 70 70)">
            <circle
                ref="dialCircle"
                cx="70"
                cy="70"
                r="50"
                class="primary-color"
                fill="transparent"
                stroke-width="18"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="meterDashOffset" />
        </g>
        <g transform="rotate(60 70 70)">
            <circle
                cx="70"
                cy="70"
                r="50"
                class="warning-color"
                fill="transparent"
                stroke-width="18"
                opacity="0.3"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="clogHeadroomDashOffset" />
        </g>
        <g transform="rotate(120 70 70)">
            <circle
                cx="70"
                cy="70"
                r="50"
                class="warning-color"
                fill="transparent"
                stroke-width="18"
                opacity="0.3"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="tangleHeadroomDashOffset" />
        </g>
        <line
            ref="minHeadroomLine"
            :x1="x1MaxClog"
            :y1="y1MaxClog"
            x2="70"
            y2="70"
            style="opacity: 0.6"
            :class="maxClogLineClasses"
            stroke-width="2"
            stroke-dashoffset="0"
            stroke-dasharray="18,63" />
        <line
            ref="minHeadroomLine"
            :x1="x1MaxTangle"
            :y1="y1MaxTangle"
            x2="70"
            y2="70"
            style="opacity: 0.6"
            :class="maxTangleLineClasses"
            stroke-width="2"
            stroke-dashoffset="0"
            stroke-dasharray="18,63" />
        <line
            :x1="X1_TANGLE"
            :y1="Y1_TANGLE"
            x2="70"
            y2="70"
            class="warning-color"
            stroke-width="2"
            stroke-dashoffset="0"
            stroke-dasharray="22,63" />
        <line
            :x1="X1_CLOG"
            :y1="Y1_CLOG"
            x2="70"
            y2="70"
            class="warning-color"
            stroke-width="2"
            stroke-dashoffset="0"
            stroke-dasharray="22,63" />
        <line
            :x1="X1_ZERO"
            :y1="Y1_ZERO"
            x2="70"
            y2="70"
            stroke="white"
            stroke-width="2"
            stroke-dashoffset="0"
            stroke-dasharray="18,63" />

        <text x="70" y="58" text-anchor="middle" class="small-text-color" font-size="12px">
            {{ flowTextUpper }}
        </text>
        <text x="70" y="72" text-anchor="middle" class="small-text-color" font-size="12px">
            {{ guardTextUpper }}
        </text>
        <text
            v-if="flowguardActive && !flowguardTrigger"
            x="70"
            y="90"
            text-anchor="middle"
            class="small-text-color"
            font-size="12px"
            font-weight="bold">
            {{ activeTextUpper }}
        </text>
        <text v-if="flowguardTrigger" x="70" y="90" text-anchor="middle" class="small-text-warning" font-size="16px">
            {{ flowguardTrigger }}
        </text>
        <text x="58" y="139" text-anchor="end" class="small-text-color" font-size="12px">
            {{ tangleTextUpper }}
        </text>
        <text x="86" y="139" class="small-text-color" font-size="12px">
            {{ clogTextUpper }}
        </text>
    </svg>
</template>

<script lang="ts">
import { Component, Mixins, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'

@Component
export default class MmuFlowguardMeter extends Mixins(BaseMixin, MmuMixin) {
    @Ref('dialCircle') dialCircle!: SVGCircleElement

    ROTATION_TIME = 1
    CIRCUMFERENCE = 2 * Math.PI * 50
    DIAL_ARC = this.CIRCUMFERENCE * (60 / 360)
    X1_TANGLE = 70 + 63 * Math.cos((120 * Math.PI) / 180)
    Y1_TANGLE = 70 + 63 * Math.sin((120 * Math.PI) / 180)
    X1_CLOG = 70 + 63 * Math.cos((60 * Math.PI) / 180)
    Y1_CLOG = 70 + 63 * Math.sin((60 * Math.PI) / 180)
    X1_ZERO = 70 + 59 * Math.cos((270 * Math.PI) / 180)
    Y1_ZERO = 70 + 59 * Math.sin((270 * Math.PI) / 180)
    DANGER = 0.8

    get tangleTextUpper() {
        return this.$t('Panels.MmuPanel.Tangle').toUpperCase()
    }

    get clogTextUpper() {
        return this.$t('Panels.MmuPanel.Clog').toUpperCase()
    }

    get flowTextUpper() {
        return this.$t('Panels.MmuPanel.Flow').toUpperCase()
    }

    get guardTextUpper() {
        return this.$t('Panels.MmuPanel.Guard').toUpperCase()
    }

    get activeTextUpper() {
        return this.$t('Panels.MmuPanel.Active').toUpperCase()
    }

    get flowguardEnabled() {
        return this.mmu?.flowguard?.enabled ?? false
    }

    get flowguardActive() {
        return this.mmu?.flowguard?.active ?? false
    }

    get flowguardTrigger() {
        return (this.mmu?.flowguard?.trigger ?? '').toUpperCase()
    }

    get maxClog() {
        return Math.abs(this.mmu?.flowguard?.max_clog ?? 0.0)
    }

    get maxTangle() {
        return -Math.abs(this.mmu?.flowguard?.max_tangle ?? 0.0)
    }

    get flowguardLevel() {
        return this.mmu?.flowguard?.level ?? 0.0
    }

    get svgClasses() {
        return { 'disabled-flowguard': !this.flowguardEnabled }
    }

    get clogWarning() {
        return Math.abs(this.maxClog) > this.DANGER
    }

    get maxClogLineClasses() {
        return {
            'warning-color': this.clogWarning,
            'primary-color': !this.clogWarning,
        }
    }

    get clogHeadroomDashOffset() {
        return this.CIRCUMFERENCE * (1 + (1 - this.DANGER) * (150 / 360))
    }

    get tangleWarning() {
        return Math.abs(this.maxTangle) > this.DANGER
    }

    get maxTangleLineClasses() {
        return {
            'warning-color': this.tangleWarning,
            'primary-color': !this.tangleWarning,
        }
    }

    get tangleHeadroomDashOffset() {
        return this.CIRCUMFERENCE * (1 - (1 - this.DANGER) * (150 / 360))
    }

    get flowguardPercent() {
        return Math.max(Math.min(1, this.flowguardLevel), -1) * 100
    }

    get meterDashOffset() {
        return this.CIRCUMFERENCE * ((100 - (this.flowguardPercent * 150) / 360) / 100)
    }

    get maxClogAngle() {
        return this.maxClog * 150 + 150
    }

    get x1MaxClog() {
        return this.calcX1(this.maxClogAngle)
    }

    get y1MaxClog() {
        return this.calcY1(this.maxClogAngle)
    }

    get maxTangleAngle() {
        return this.maxTangle * 150 + 150
    }

    get x1MaxTangle() {
        return this.calcX1(this.maxTangleAngle)
    }

    get y1MaxTangle() {
        return this.calcY1(this.maxTangleAngle)
    }

    private calcX1(angle: number) {
        return 70 + 59 * Math.cos(((120 + angle) * Math.PI) / 180)
    }

    private calcY1(angle: number) {
        return 70 + 59 * Math.sin(((120 + angle) * Math.PI) / 180)
    }

    @Watch('meterDashOffset', { immediate: true })
    onDashOffsetChanged(newValue: number) {
        if (!this.dialCircle) return

        const currentOffset = parseFloat(this.dialCircle?.style?.strokeDashoffset) || this.CIRCUMFERENCE
        const difference = Math.abs(currentOffset - newValue)
        const duration = (difference / this.CIRCUMFERENCE) * this.ROTATION_TIME
        this.dialCircle.style.transition = `stroke-dashoffset ${duration}s ease-out`
    }
}
</script>

<style scoped>
.disabled-flowguard {
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
.small-text-warning {
    fill: var(--v-error-base, #ff0000);
}
</style>
