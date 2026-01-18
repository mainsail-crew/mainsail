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
                class="overlay-row mb-1 d-flex align-center"
                :title="row.title">
                <v-icon small class="mr-2 overlay-icon">{{ row.icon }}</v-icon>
                <span class="sr-only">{{ row.title }}</span>
                <template v-if="row.values">
                    <span v-for="value in row.values" :key="value" class="overlay-chip mr-2">
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
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { formatPrintTime } from '@/plugins/helpers'
import {
    mdiCalendarClock,
    mdiClockOutline,
    mdiFan,
    mdiLayersTriple,
    mdiPrinter3dNozzle,
    mdiProgressClock,
    mdiRadiator,
    mdiSpeedometer,
    mdiWaterPercent,
} from '@mdi/js'

type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type OverlayPositionKey =
    | 'overlayExtrudersPosition'
    | 'overlayHeatbedPosition'
    | 'overlayFanSpeedPosition'
    | 'overlayPrintTimePosition'
    | 'overlayEstimatePosition'
    | 'overlayEtaPosition'
    | 'overlayFlowRatePosition'
    | 'overlaySpeedPosition'
    | 'overlayLayerCountPosition'

type OverlayValueKey = 'printTime' | 'estimate' | 'flowRate' | 'speed' | 'layerCount' | 'eta' | 'fan'

interface ExtruderTemperature {
    key: string
    label: string
    temperature: number | null
    target: number | null
}

interface OverlayRow {
    key: string
    icon: string
    title: string
    values?: string[]
    value?: string
}

interface OverlayGroup {
    position: OverlayPosition
    rows: OverlayRow[]
    classes: string[]
    style: Record<string, string>
}

@Component
export default class WebcamStatsOverlay extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly webcam!: GuiWebcamStateWebcam
    @Prop({ type: String, default: 'auto' })
    readonly overlayDisplayMode!: 'auto' | 'all' | 'hidden' | 'dummy'

    mdiPrinter3dNozzle = mdiPrinter3dNozzle
    mdiRadiator = mdiRadiator
    mdiFan = mdiFan
    mdiClockOutline = mdiClockOutline
    mdiCalendarClock = mdiCalendarClock
    mdiProgressClock = mdiProgressClock
    mdiWaterPercent = mdiWaterPercent
    mdiSpeedometer = mdiSpeedometer
    mdiLayersTriple = mdiLayersTriple

    get isDummyMode() {
        return this.overlayDisplayMode === 'dummy'
    }

    get isShowAllMode() {
        return this.overlayDisplayMode === 'all'
    }

    get isHiddenMode() {
        return this.overlayDisplayMode === 'hidden'
    }

    get overlaysEnabled() {
        return this.webcam.extra_data?.overlaysEnabled ?? false
    }

    get showExtruders() {
        return this.webcam.extra_data?.overlayShowExtruders ?? false
    }

    get showHeatbed() {
        return this.webcam.extra_data?.overlayShowHeatbed ?? false
    }

    get showFanSpeed() {
        return this.webcam.extra_data?.overlayShowFanSpeed ?? false
    }

    get showPrintTime() {
        return this.webcam.extra_data?.overlayShowPrintTime ?? false
    }

    get showEstimate() {
        return this.webcam.extra_data?.overlayShowEstimate ?? false
    }

    get showEta() {
        return this.webcam.extra_data?.overlayShowEta ?? false
    }

    get showFlowRate() {
        return this.webcam.extra_data?.overlayShowFlowRate ?? false
    }

    get showSpeed() {
        return this.webcam.extra_data?.overlayShowSpeed ?? false
    }

    get showLayerCount() {
        return this.webcam.extra_data?.overlayShowLayerCount ?? false
    }

    get estimateSource(): 'avg' | 'slicer' {
        return this.webcam.extra_data?.overlayEstimateSource ?? 'avg'
    }

    get overlayGroups(): OverlayGroup[] {
        if (this.isHiddenMode) return []

        const groups = new Map<OverlayPosition, OverlayGroup>()

        const addRow = (positionKey: OverlayPositionKey, row: OverlayRow) => {
            if (!this.overlaysEnabled) return
            const position = this.getOverlayPositionValue(positionKey)
            let group = groups.get(position)
            if (!group) {
                group = {
                    position,
                    rows: [],
                    classes: this.getOverlayPositionClasses(position),
                    style: this.getOverlayPositionStyle(position),
                }
                groups.set(position, group)
            }
            group.rows.push(row)
        }

        const extruderList = this.extruderTemperatures
        if (this.showExtruders && extruderList.length) {
            addRow('overlayExtrudersPosition', {
                key: 'extruders',
                icon: this.mdiPrinter3dNozzle,
                title: this.$t('Panels.WebcamPanel.OverlayExtruders').toString(),
                values: extruderList.map((item) => {
                    return `${item.label} ${this.formatTemperature(item.temperature, item.target)}`
                }),
            })
        }

        const heatbed = this.heatbedTemperature
        if (this.showHeatbed && heatbed) {
            addRow('overlayHeatbedPosition', {
                key: 'heatbed',
                icon: this.mdiRadiator,
                title: this.$t('Panels.WebcamPanel.OverlayHeatbed').toString(),
                value: this.formatTemperature(heatbed.temperature, heatbed.target),
            })
        }

        const fanSpeedText = this.fanSpeedText
        if (this.showFanSpeed && fanSpeedText !== null) {
            addRow('overlayFanSpeedPosition', {
                key: 'fan',
                icon: this.mdiFan,
                title: this.$t('Panels.WebcamPanel.OverlayFanSpeed').toString(),
                value: fanSpeedText,
            })
        }

        const printTimeText = this.printTimeText
        if (this.showPrintTime && printTimeText !== null) {
            addRow('overlayPrintTimePosition', {
                key: 'print-time',
                icon: this.mdiClockOutline,
                title: this.$t('Panels.WebcamPanel.OverlayPrintTime').toString(),
                value: printTimeText,
            })
        }

        const estimateText = this.estimateText
        if (this.showEstimate && estimateText !== null) {
            addRow('overlayEstimatePosition', {
                key: 'estimate',
                icon: this.mdiProgressClock,
                title: this.$t('Panels.WebcamPanel.OverlayEstimate').toString(),
                value: estimateText,
            })
        }

        const etaText = this.etaText
        if (this.showEta && etaText !== null) {
            addRow('overlayEtaPosition', {
                key: 'eta',
                icon: this.mdiCalendarClock,
                title: this.$t('Panels.WebcamPanel.OverlayEta').toString(),
                value: etaText,
            })
        }

        const flowRateText = this.flowRateText
        if (this.showFlowRate && flowRateText !== null) {
            addRow('overlayFlowRatePosition', {
                key: 'flow-rate',
                icon: this.mdiWaterPercent,
                title: this.$t('Panels.WebcamPanel.OverlayFlowRate').toString(),
                value: flowRateText,
            })
        }

        const speedText = this.speedText
        if (this.showSpeed && speedText !== null) {
            addRow('overlaySpeedPosition', {
                key: 'speed',
                icon: this.mdiSpeedometer,
                title: this.$t('Panels.WebcamPanel.OverlaySpeed').toString(),
                value: speedText,
            })
        }

        const layerCountText = this.layerCountText
        if (this.showLayerCount && layerCountText !== null) {
            addRow('overlayLayerCountPosition', {
                key: 'layers',
                icon: this.mdiLayersTriple,
                title: this.$t('Panels.WebcamPanel.OverlayLayerCount').toString(),
                value: layerCountText,
            })
        }

        return Array.from(groups.values())
    }

    get extruderTemperatures(): ExtruderTemperature[] {
        const extruders: ExtruderTemperature[] = []
        const printerState = this.$store.state.printer ?? {}

        Object.keys(printerState).forEach((key) => {
            const match = key.match(/^extruder(\d*)$/)
            if (!match) return

            const extruder = printerState[key]
            if (!extruder) return

            const temperature = typeof extruder.temperature === 'number' ? extruder.temperature : null
            const target = typeof extruder.target === 'number' ? extruder.target : null
            if (temperature === null && target === null) return

            const index = match[1] === '' ? '0' : match[1]

            extruders.push({
                key,
                label: `E${index}`,
                temperature,
                target,
            })
        })

        const sorted = extruders.sort((a, b) => {
            const aIndex = parseInt(a.label.slice(1), 10)
            const bIndex = parseInt(b.label.slice(1), 10)
            return aIndex - bIndex
        })
        if (sorted.length) return sorted

        if (this.isDummyMode) {
            return [
                { key: 'dummy-extruder-0', label: 'E0', temperature: 215, target: 225 },
                { key: 'dummy-extruder-1', label: 'E1', temperature: 205, target: 210 },
            ]
        }

        if (this.isShowAllMode) {
            return [{ key: 'fallback-extruder-0', label: 'E0', temperature: 0, target: 0 }]
        }

        return []
    }

    get heatbedTemperature() {
        const heaterBed = this.$store.state.printer.heater_bed ?? null
        if (heaterBed) {
            const temperature = typeof heaterBed.temperature === 'number' ? heaterBed.temperature : null
            const target = typeof heaterBed.target === 'number' ? heaterBed.target : null

            if (temperature !== null || target !== null) return { temperature, target }
        }

        if (this.isDummyMode) return { temperature: 60, target: 60 }
        if (this.isShowAllMode) return { temperature: 0, target: 0 }

        return null
    }

    get fanSpeed() {
        const speed = this.$store.getters['printer/getPartFanSpeed']
        if (typeof speed !== 'number') return null

        return Math.round(speed * 100)
    }

    get fanSpeedText() {
        const value = this.fanSpeed
        const text = value !== null ? `${value}%` : null
        return this.resolveValue('fan', text)
    }

    get estimateValue() {
        const source = this.estimateSource
        const getter = source === 'slicer' ? 'printer/getEstimatedTimeSlicer' : 'printer/getEstimatedTimeAvg'
        const seconds = this.$store.getters[getter] ?? 0
        if (!seconds) return null

        return this.formatDuration(seconds)
    }

    get estimateText() {
        return this.resolveValue('estimate', this.estimateValue)
    }

    get liveExtruderVelocity() {
        const velocity = this.$store.state.printer.motion_report?.live_extruder_velocity
        if (velocity === null || velocity === undefined) return null

        return velocity > 0 ? velocity : 0
    }

    get activeExtruder() {
        return this.$store.state.printer.toolhead?.extruder ?? 'extruder'
    }

    get activeExtruderSettings() {
        return this.$store.state.printer.configfile?.settings?.[this.activeExtruder] ?? {}
    }

    get filamentDiameter() {
        return this.activeExtruderSettings?.filament_diameter ?? 1.75
    }

    get flowRate() {
        const velocity = this.liveExtruderVelocity
        if (velocity === null) return null

        const filamentCrossSection = Math.pow(this.filamentDiameter / 2, 2) * Math.PI
        const currentFlow = filamentCrossSection * velocity

        if (!isFinite(currentFlow) || currentFlow <= 0) return null

        return currentFlow
    }

    get flowRateText() {
        const flowRate = this.flowRate
        const text = flowRate !== null ? `${flowRate.toFixed(1)} mm³/s` : null
        return this.resolveValue('flowRate', text)
    }

    get live_velocity() {
        return Math.abs(this.$store.state.printer.motion_report?.live_velocity?.toFixed(0)) ?? null
    }

    get speedText() {
        const speed = this.live_velocity
        const text = speed !== null && !Number.isNaN(speed) ? `${speed} mm/s` : null
        return this.resolveValue('speed', text)
    }

    get overlayPrintTimeSource(): 'total' | 'current' {
        return this.webcam.extra_data?.overlayPrintTimeSource ?? 'total'
    }

    get printTimeValue() {
        const duration =
            this.overlayPrintTimeSource === 'total'
                ? (this.$store.state.printer.print_stats?.total_duration ?? 0)
                : (this.$store.state.printer.print_stats?.print_duration ?? 0)
        if (!duration) return null

        return formatPrintTime(duration, false)
    }

    get printTimeText() {
        return this.resolveValue('printTime', this.printTimeValue)
    }

    get currentLayerNumber() {
        return this.$store.getters['printer/getPrintCurrentLayer'] ?? 0
    }

    get maxLayerNumber() {
        return this.$store.getters['printer/getPrintMaxLayers'] ?? 0
    }

    get layerCountValue() {
        const current = this.currentLayerNumber
        const max = this.maxLayerNumber

        if (current <= 0 && max <= 0) return null
        if (max > 0) return `${current} / ${max}`

        return `${current}`
    }

    get layerCountText() {
        return this.resolveValue('layerCount', this.layerCountValue)
    }

    get etaValue() {
        const eta = this.$store.getters['printer/getEstimatedTimeETAFormat'] ?? '--'
        if (!eta || eta === '--') return null

        return eta
    }

    get etaText() {
        return this.resolveValue('eta', this.etaValue)
    }

    formatTemperature(current: number | null, target: number | null) {
        const formattedCurrent = current !== null ? `${current.toFixed(0)}°C` : '--'
        if (target === null || target === undefined) return formattedCurrent
        return `${formattedCurrent} / ${target.toFixed(0)}°C`
    }

    private getOverlayPositionValue(key: OverlayPositionKey): OverlayPosition {
        const extraData = (this.webcam.extra_data ?? {}) as Record<string, OverlayPosition | undefined>
        const storedPosition = extraData[key]
        if (storedPosition) return storedPosition

        const defaultPosition = extraData.overlayPosition
        if (defaultPosition) return defaultPosition

        return 'bottom-left'
    }

    private getOverlayPositionClasses(position: OverlayPosition) {
        const [vertical, horizontal] = position.split('-') as ['top' | 'bottom', 'left' | 'right']
        return [`overlay-${position}`, `overlay-${vertical}`, `overlay-${horizontal}`]
    }

    private getOverlayPositionStyle(position: OverlayPosition) {
        const color = this.overlayBackgroundColor
        const [vertical] = position.split('-') as ['top' | 'bottom']
        const gradient =
            vertical === 'top'
                ? `linear-gradient(180deg, ${color}, rgba(0,0,0,0))`
                : `linear-gradient(180deg, rgba(0,0,0,0), ${color})`

        return {
            background: gradient,
        }
    }

    get overlayBackgroundColor() {
        return this.webcam.extra_data?.overlayBackgroundColor ?? 'rgba(0, 0, 0, 0.7)'
    }

    private resolveValue(key: OverlayValueKey, value: string | null): string | null {
        if (value !== null) return value
        if (this.isDummyMode) return this.getDummyValue(key)
        if (this.isShowAllMode) return this.getFallbackValue(key)
        return null
    }

    private getFallbackValue(key: OverlayValueKey): string {
        switch (key) {
            case 'printTime':
            case 'estimate':
                return '0:00:00'
            case 'flowRate':
                return '0.0 mm³/s'
            case 'speed':
                return '0 mm/s'
            case 'layerCount':
                return '0 / 0'
            case 'eta':
                return '--:--'
            case 'fan':
                return '0%'
            default:
                return '--'
        }
    }

    private getDummyValue(key: OverlayValueKey): string {
        switch (key) {
            case 'printTime':
                return '1:23:45'
            case 'estimate':
                return '0:45:00'
            case 'flowRate':
                return '12.3 mm³/s'
            case 'speed':
                return '150 mm/s'
            case 'layerCount':
                return '125 / 250'
            case 'eta':
                return '12:34'
            case 'fan':
                return '75%'
            default:
                return '--'
        }
    }

    private formatDuration(seconds: number) {
        let remaining = Math.abs(seconds)
        const sign = seconds < 0 ? '-' : ''
        const hours = Math.floor(remaining / 3600)
        remaining -= hours * 3600
        const minutes = Math.floor(remaining / 60)
        const secs = Math.floor(remaining % 60)

        const h = hours > 0 ? `${hours}:` : ''
        const m = `${hours > 0 ? minutes.toString().padStart(2, '0') : minutes}`
        const s = secs.toString().padStart(2, '0')

        return `${sign}${h}${m}:${s}`
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
    gap: 4px;
    margin: 8px;
    pointer-events: none;
}

.overlay-row {
    font-size: 0.9rem;
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
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
}

.overlay-block.overlay-bottom {
    bottom: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7));
}

.overlay-block.overlay-top {
    padding-top: 12px;
}

.overlay-block.overlay-bottom {
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
