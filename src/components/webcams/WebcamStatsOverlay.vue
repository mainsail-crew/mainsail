<template>
    <div v-if="overlayGroups.length" class="webcam-stats-overlay">
        <div
            v-for="group in overlayGroups"
            :key="group.position"
            :class="['overlay-block pa-3', ...group.classes]"
            :style="group.style">
            <div
                v-for="row in group.rows"
                :key="row.key"
                class="overlay-row d-flex align-center"
                :style="{ fontSize: effectiveFontSize + 'px', lineHeight: '1.4', marginBottom: '0.3em' }"
                :title="row.title">
                <v-icon small class="mr-2 overlay-icon">{{ row.icon }}</v-icon>
                <span class="sr-only">{{ row.title }}</span>
                <template v-if="Array.isArray(row.value)">
                    <span v-for="value in row.value" :key="value" class="overlay-chip mr-2">
                        {{ value }}
                    </span>
                </template>
                <span v-else class="overlay-value">
                    {{ row.value }}
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {
    GuiWebcamStateWebcam,
    OverlayItemKey,
    OverlayPosition,
    WebcamOverlayDisplayMode,
} from '@/store/gui/webcams/types'
import { DEFAULT_OVERLAY_BACKGROUND, OVERLAY_ITEMS, resolveOverlayItem } from '@/components/webcams/overlayItems'
import { formatPrintTime } from '@/plugins/helpers'

type OverlayValue = string | string[] | null

interface OverlayRow {
    key: OverlayItemKey
    icon: string
    title: string
    value: string | string[]
}

interface OverlayGroup {
    position: OverlayPosition
    rows: OverlayRow[]
    classes: string[]
    style: Record<string, string>
}

/**
 * Printer statistics rendered on top of a webcam stream, grouped by corner.
 * Items without a current value are hidden; `overlayDisplayMode="dummy"` substitutes preview values instead.
 */
@Component
export default class WebcamStatsOverlay extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly webcam!: GuiWebcamStateWebcam
    @Prop({ type: String, default: 'auto' }) readonly overlayDisplayMode!: WebcamOverlayDisplayMode
    /** Font size in px; defaults to 14. */
    @Prop({ type: Number, default: null }) readonly fontSizeOverride!: number | null

    get effectiveFontSize() {
        return this.fontSizeOverride ?? 14
    }

    get overlays() {
        return this.webcam.extra_data?.overlays
    }

    get backgroundColor() {
        return this.overlays?.backgroundColor ?? DEFAULT_OVERLAY_BACKGROUND
    }

    get overlayGroups(): OverlayGroup[] {
        if (this.overlayDisplayMode === 'hidden' || !this.overlays?.enabled) return []

        const groups = new Map<OverlayPosition, OverlayGroup>()
        const isDummy = this.overlayDisplayMode === 'dummy'

        OVERLAY_ITEMS.forEach((definition) => {
            const config = resolveOverlayItem(this.overlays, definition.key)
            if (!config.enabled) return

            const value = this.getValue(definition.key, config.source) ?? (isDummy ? definition.dummy : null)
            if (value === null) return

            let group = groups.get(config.position)
            if (!group) {
                group = {
                    position: config.position,
                    rows: [],
                    classes: this.getPositionClasses(config.position),
                    style: this.getPositionStyle(config.position),
                }
                groups.set(config.position, group)
            }

            group.rows.push({
                key: definition.key,
                icon: definition.icon,
                title: this.$t(definition.title).toString(),
                value,
            })
        })

        return Array.from(groups.values())
    }

    /** Current live value of an item, or null when the printer provides none. */
    getValue(key: OverlayItemKey, source?: string): OverlayValue {
        switch (key) {
            case 'extruders':
                return this.extrudersValue
            case 'heatbed':
                return this.heatbedValue
            case 'fan':
                return this.fanValue
            case 'speed':
                return this.speedValue
            case 'flowRate':
                return this.flowRateValue
            case 'printTime':
                return this.getPrintTimeValue(source)
            case 'estimate':
                return this.getEstimateValue(source)
            case 'layerCount':
                return this.layerCountValue
            case 'eta':
                return this.etaValue
        }
    }

    /** One `E<n> <temp>` entry per extruder with a reported temperature or target, sorted by index. */
    get extrudersValue(): OverlayValue {
        const printerState = this.$store.state.printer ?? {}

        const entries = Object.keys(printerState)
            .map((key) => {
                const match = key.match(/^extruder(\d*)$/)
                if (!match) return null

                const temperature = this.toNumberOrNull(printerState[key]?.temperature)
                const target = this.toNumberOrNull(printerState[key]?.target)
                if (temperature === null && target === null) return null

                const index = match[1] === '' ? 0 : parseInt(match[1], 10)
                return { index, text: `E${index} ${this.formatTemperature(temperature, target)}` }
            })
            .filter((entry): entry is { index: number; text: string } => entry !== null)
            .sort((a, b) => a.index - b.index)

        return entries.length ? entries.map((entry) => entry.text) : null
    }

    get heatbedValue(): OverlayValue {
        const heaterBed = this.$store.state.printer.heater_bed
        const temperature = this.toNumberOrNull(heaterBed?.temperature)
        const target = this.toNumberOrNull(heaterBed?.target)
        if (temperature === null && target === null) return null

        return this.formatTemperature(temperature, target)
    }

    get fanValue(): OverlayValue {
        const speed = this.$store.getters['printer/getPartFanSpeed']
        if (typeof speed !== 'number') return null

        return `${Math.round(speed * 100)}%`
    }

    get speedValue(): OverlayValue {
        const velocity = this.toNumberOrNull(this.$store.state.printer.motion_report?.live_velocity)
        if (velocity === null) return null

        return `${Math.round(Math.abs(velocity))} mm/s`
    }

    /** Volumetric flow of the active extruder in mm³/s; null when not extruding. */
    get flowRateValue(): OverlayValue {
        const velocity = this.toNumberOrNull(this.$store.state.printer.motion_report?.live_extruder_velocity)
        if (velocity === null || velocity <= 0) return null

        const activeExtruder = this.$store.state.printer.toolhead?.extruder ?? 'extruder'
        const diameter = this.$store.state.printer.configfile?.settings?.[activeExtruder]?.filament_diameter ?? 1.75
        const flow = Math.pow(diameter / 2, 2) * Math.PI * velocity
        if (!isFinite(flow) || flow <= 0) return null

        return `${flow.toFixed(1)} mm³/s`
    }

    get layerCountValue(): OverlayValue {
        const current = this.$store.getters['printer/getPrintCurrentLayer'] ?? 0
        const max = this.$store.getters['printer/getPrintMaxLayers'] ?? 0

        if (current <= 0 && max <= 0) return null
        if (max > 0) return `${current} / ${max}`

        return `${current}`
    }

    get etaValue(): OverlayValue {
        const eta = this.$store.getters['printer/getEstimatedTimeETAFormat']
        if (!eta || eta === '--') return null

        return eta
    }

    /** `source`: 'total' = total_duration (incl. pauses), otherwise print_duration. */
    getPrintTimeValue(source?: string): OverlayValue {
        const printStats = this.$store.state.printer.print_stats
        const duration = source === 'total' ? printStats?.total_duration : printStats?.print_duration

        return this.formatDuration(duration)
    }

    /** `source`: 'slicer' = slicer-based estimate, otherwise the averaged estimate. */
    getEstimateValue(source?: string): OverlayValue {
        const getter = source === 'slicer' ? 'printer/getEstimatedTimeSlicer' : 'printer/getEstimatedTimeAvg'

        return this.formatDuration(this.$store.getters[getter])
    }

    formatDuration(seconds: unknown): OverlayValue {
        if (typeof seconds !== 'number' || seconds <= 0) return null

        return formatPrintTime(seconds, false)
    }

    formatTemperature(current: number | null, target: number | null) {
        const formattedCurrent = current !== null ? `${current.toFixed(0)}°C` : '--'
        if (target === null) return formattedCurrent

        return `${formattedCurrent} / ${target.toFixed(0)}°C`
    }

    toNumberOrNull(value: unknown): number | null {
        return typeof value === 'number' ? value : null
    }

    getPositionClasses(position: OverlayPosition) {
        const [vertical, horizontal] = position.split('-')
        return [`overlay-${vertical}`, `overlay-${horizontal}`]
    }

    /** Gradient fading from the configured color at the anchored edge to transparent. */
    getPositionStyle(position: OverlayPosition) {
        const color = this.backgroundColor
        const background = position.startsWith('top')
            ? `linear-gradient(180deg, ${color}, rgba(0,0,0,0))`
            : `linear-gradient(180deg, rgba(0,0,0,0), ${color})`

        return { background }
    }
}
</script>

<style scoped>
.webcam-stats-overlay {
    position: absolute;
    pointer-events: none;
    inset: 0;
}

.overlay-block {
    position: absolute;
    max-width: min(320px, 90%);
    color: #fff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    margin: 8px;
}

.overlay-row {
    flex-wrap: wrap;
}

.overlay-chip {
    font-weight: 500;
}

.overlay-value {
    font-weight: 600;
}

.overlay-icon {
    color: inherit;
}

.overlay-block.overlay-left {
    left: 0;
    text-align: left;
    align-items: flex-start;
}

.overlay-block.overlay-right {
    right: 0;
    text-align: right;
    align-items: flex-end;
}

.overlay-block.overlay-top {
    top: 0;
    padding-top: 12px;
}

.overlay-block.overlay-bottom {
    bottom: 0;
    padding-bottom: 12px;
}

.overlay-block.overlay-right .overlay-row {
    justify-content: flex-end;
}

.overlay-block.overlay-left .overlay-row {
    justify-content: flex-start;
}

.sr-only {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}
</style>
