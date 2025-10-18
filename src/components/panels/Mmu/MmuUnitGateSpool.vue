<template>
    <v-tooltip :disabled="!showDetails" :open-delay="500" top>
        <template #activator="{ on, attrs }">
            <svg
                ref="mmuSpoolSvg"
                viewBox="0 0 248 500"
                preserveAspectRatio="xMidYMid meet"
                :width="spoolWidth"
                v-bind="attrs"
                :class="svgClasses"
                v-on="on"
                @click="selectGate">
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
                    <radialGradient id="spotlight" cx="50%" cy="70%" r="50%" fx="50%" fy="100%">
                        <stop offset="0%" style="stop-color: rgba(255, 255, 255, 0.9); stop-opacity: 1" />
                        <stop offset="100%" style="stop-color: rgba(255, 255, 0, 0); stop-opacity: 0" />
                    </radialGradient>
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
                    <use
                        href="#oval"
                        transform="scale(0.41)"
                        style="filter: url(#blur_wheel2)"
                        :fill="spoolWheelColor" />
                    <use href="#center" transform="scale(0.41)" :fill="spoolWheelColor" />
                </g>
                <path
                    v-if="isNotEmpty"
                    ref="filament"
                    d="M 0 -63 C 35 -63 63 -35 63 0 C 63 35 35 63 0 63 L -424 63 L -424 -63 z"
                    vector-effect="non-scaling-stroke"
                    :fill="filamentColor"
                    :transform="filamentTransform" />
                <g transform="matrix(0.59,0,0,3.95,37,250)">
                    <use href="#oval" style="filter: url(#blur_wheel2)" :fill="spoolWheelColor" />
                    <use href="#oval" transform="scale(0.41)" fill="#111111" />
                </g>
                <rect v-if="isSelected" x="0" y="314" width="258" height="186" fill="url(#spotlight)" />

                <g v-if="showDetails">
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
                        v-else-if="filamentAmount === 0 && status !== GATE_EMPTY"
                        x="140"
                        y="310"
                        text-anchor="middle"
                        font-weight="bold"
                        font-size="160px"
                        style="
                            fill: red;
                            stroke: #111111;
                            stroke-width: 6;
                            stroke-linecap: round;
                            stroke-linejoin: round;
                        ">
                        !
                    </text>
                    <use v-if="isEspoolerRewind" href="#espool" transform="translate(225,0) rotate(90) scale(2,2)" />
                    <use
                        v-if="isEspoolerAssist"
                        href="#espool"
                        transform="translate(225,500) rotate(270) scale(2,-2)" />
                </g>
            </svg>
        </template>
        <div class="spool-tooltip">
            <div v-if="tooltipTitle" class="d-block font-weight-bold">{{ tooltipTitle }}</div>
            <div>{{ tooltipText }}</div>
        </div>
    </v-tooltip>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { GATE_EMPTY, GATE_UNKNOWN, NO_FILAMENT_COLOR } from '@/components/mixins/mmu'
import { filamentTextColor } from '@/plugins/helpers'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

@Component
export default class MmuUnitGateSpool extends Mixins(BaseMixin, MmuMixin) {
    GATE_EMPTY = GATE_EMPTY

    @Prop({ default: '#AD8762' }) readonly spoolWheelColor!: string
    @Prop({ required: true }) readonly gateIndex!: number
    @Prop({ default: false }) readonly showDetails!: boolean
    @Prop({ default: false }) readonly isSelected!: boolean
    @Prop({ default: '' }) readonly svgClass!: string

    get showUnavailableSpoolColor(): boolean {
        return this.$store.state.gui.view.mmu.showUnavailableSpoolColor ?? false
    }

    get status() {
        return this.mmu?.gate_status?.[this.gateIndex] ?? GATE_UNKNOWN
    }

    get isNotEmpty() {
        return this.filamentAmount !== 0 || this.status !== GATE_EMPTY
    }

    get filamentAmount() {
        if (this.status === GATE_EMPTY && !(this.showUnavailableSpoolColor && this.filamentColor !== NO_FILAMENT_COLOR))
            return 0

        if (!this.spool || this.spoolmanSupport === 'off') return -1

        // Pull live from spoolman and calculate percentage
        const remaining = this.spool.remaining_weight ?? null
        const total = this.spool.initial_weight ?? this.spool.filament?.weight ?? null
        if (remaining === null || total === null) return -1

        return Math.ceil(Math.max(0, Math.min(100, (remaining / total) * 100)))
    }

    get spoolId() {
        return this.mmu?.gate_spool_id?.[this.gateIndex] ?? -1
    }

    get spool() {
        const spools = this.$store.state.server.spoolman?.spools ?? []
        return spools.find((spool: ServerSpoolmanStateSpool) => spool.id === this.spoolId) ?? null
    }

    get spoolName() {
        const mmuSpoolName = this.mmu?.gate_filament_name?.[this.gateIndex]

        return this.spool?.name || mmuSpoolName || this.$t('Panels.MmuPanel.Unknown').toString()
    }

    get filamentColor() {
        return this.formColorString(this.mmu?.gate_color?.[this.gateIndex] ?? null)
    }

    get filamentMaterial() {
        return this.mmu?.gate_material?.[this.gateIndex] || this.$t('Panels.MmuPanel.Unknown').toString()
    }

    get filamentTemperature() {
        return this.mmu?.gate_temperature?.[this.gateIndex] ?? -1
    }

    get filamentTransformScale1() {
        const start = 0.28
        const end = 0.4

        if (this.filamentAmount < 0) return end

        return start + (end - start) * (this.filamentAmount / 100)
    }

    get filamentTransformScale2() {
        const start = 1.65
        const end = 3.5

        if (this.filamentAmount < 0) return end

        return start + (end - start) * (this.filamentAmount / 100)
    }

    get filamentTransform() {
        return `matrix(${this.filamentTransformScale1},0,0,${this.filamentTransformScale2},197,250)`
    }

    get contrastColor() {
        return filamentTextColor(this.filamentColor)
    }

    get isEspoolerRewind() {
        if (this.gateIndex !== this.mmu?.gate) return false

        return this.mmu?.espooler_active === 'rewind'
    }

    get isEspoolerAssist() {
        if (this.gateIndex !== this.mmu?.gate) return false

        return this.mmu?.espooler_active === 'assist'
    }

    get spoolWidth() {
        if (this.numGates <= 8) return 56
        if (this.numGates <= 16) return 48

        return 40
    }

    get tooltipTitle() {
        if (this.status === GATE_EMPTY) return null

        return this.spoolName
    }

    get tooltipText() {
        if (this.status === GATE_EMPTY) {
            return this.$t('Panels.MmuPanel.ToolTip.Empty')
        }

        const output = []

        let temperature = ''
        if (this.filamentTemperature > 0) {
            temperature = ` | ${this.filamentTemperature}°C`
        }
        output.push(this.filamentMaterial + temperature)

        if (this.filamentColor !== NO_FILAMENT_COLOR) {
            let color = this.filamentColor.substring(0, 7)
            const alpha = this.filamentColor.length > 7 ? this.filamentColor.substring(7, 9) : 'FF'
            if (alpha.toUpperCase() !== 'FF') color += alpha

            output.push(`${this.$t('Panels.MmuPanel.ToolTip.Color')}: ${color}`)
        }

        if (this.spoolId) {
            output.push(`${this.$t('Panels.MmuPanel.ToolTip.SpoolId')}: ${this.spoolId}`)
        }

        return output.join('\n')
    }

    get svgClasses() {
        const classes = [this.svgClass]
        if (this.hasSelectGateListener) classes.push('hasSelectGate')
        if (this.isSelected) classes.push('isSelected')

        return classes
    }

    get hasSelectGateListener() {
        return !!this.$listeners['select-gate']
    }

    selectGate() {
        this.$emit('select-gate')
    }
}
</script>

<style scoped>
svg {
    outline: none;
    cursor: pointer;
    transition: transform 0.2s;
}

svg.isSelected {
    transform: translateY(-8px) !important;
}

svg.hasSelectGate:hover {
    transform: translateY(-4px);
}

.spool-tooltip {
    white-space: pre;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
