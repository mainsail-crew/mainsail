<template>
    <div class="mmu-unit-footer zindex-4 d-flex flex-row align-center px-2 pb-1">
        <v-icon
            v-if="showFooter && showLogos"
            class="mr-4 flex-grow-0 flex-shrink-0 opacity-70"
            :class="logoClasses"
            :size="logoHeight">
            {{ logo }}
        </v-icon>
        <div v-if="showFooter" class="flex-grow-1 flex-shrink-1 min-width-0 text-caption">
            <div v-if="showName" class="text-truncate">{{ unitDisplayName }}</div>
            <v-tooltip
                v-if="showDetails && showClimate"
                v-model="isTooltipOpen"
                :disabled="!showPerGateReport"
                top
                open-delay="500">
                <template #activator="{ on, attrs }">
                    <div class="text-truncate d-flex" v-bind="attrs" v-on="on">
                        <span v-if="unitClimateHumidity" class="d-inline-flex align-center mr-1">
                            <v-icon v-if="showClimateIcons" size="18" class="blue--text ml-n1">{{ mdiWater }}</v-icon>
                            {{ unitClimateHumidity }}
                        </span>
                        <span v-if="unitClimateTemp" class="d-inline-flex align-center mr-2">
                            <v-icon v-if="showClimateIcons" size="18" class="deep-orange--text">
                                {{ mdiThermometer }}
                            </v-icon>
                            {{ unitClimateTemp }}
                        </span>
                        <span v-if="unitHeaterIcon" class="d-inline-flex align-center ml-auto">
                            <v-icon size="22" class="red--text">{{ unitHeaterIcon }}</v-icon>
                            {{ unitHeaterTemp }}
                        </span>
                    </div>
                </template>
                <span style="white-space: pre-line">{{ perGateReport }}</span>
            </v-tooltip>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { MmuEnvironmentSensor, MmuFilamentHeater, MmuMachineUnit } from '@/components/mixins/mmu'
import { mdiWater, mdiThermometer, mdiHeatingCoil, mdiRotateOrbit } from '@mdi/js'
import {
    mmuIcon3MS,
    mmuIconAngryBeaver,
    mmuIconBoxTurtle,
    mmuIconEmu,
    mmuIconErcf,
    mmuIconHappyHare,
    mmuIconKms,
    mmuIconMmx,
    mmuIconNightOwl,
    mmuIconQuattroBox,
    mmuIconTradrack,
    mmuIconVvd,
    mmuThemeIcons,
} from '@/plugins/mmuIcons'
import { additionalSensors } from '@/store/variables'

const squareLogoVendors = ['3MS', 'AngryBeaver', 'EMU', 'ERCF', 'KMS']

// A filament heater and an environment sensor share the same numeric metrics we read for display.
type MmuClimateMetric = Partial<MmuFilamentHeater & MmuEnvironmentSensor>

@Component
export default class MmuUnitFooter extends Mixins(BaseMixin, MmuMixin) {
    mdiWater = mdiWater
    mdiThermometer = mdiThermometer
    mdiHeatingCoil = mdiHeatingCoil
    mdiRotateOrbit = mdiRotateOrbit

    @Prop({ required: true }) readonly unitIndex!: number
    @Prop({ required: true }) readonly mmuMachineUnit!: MmuMachineUnit
    @Prop({ default: true }) readonly showDetails!: boolean
    @Prop({ default: true }) readonly showFooter!: boolean

    @Watch('isTooltipOpen')
    onTooltipOpenChanged(open: boolean) {
        if (open && this.showPerGateReport) {
            this.perGateReport = this.generatePerGateReport()
        } else {
            this.perGateReport = ''
        }
    }

    isTooltipOpen = false
    perGateReport = ''

    get numGates() {
        return this.mmuMachineUnit?.num_gates ?? 0
    }

    get firstGateNumber() {
        return this.mmuMachineUnit?.first_gate ?? 0
    }

    get unitDisplayName(): string {
        const name = this.mmuMachineUnit?.name

        return `#${this.unitIndex + 1} ${name}`
    }

    get showLogos(): boolean {
        return this.$store.state.gui.view.mmu.showLogos ?? true
    }

    get showName(): boolean {
        return this.$store.state.gui.view.mmu.showName ?? true
    }

    get showClimate(): boolean {
        return this.$store.state.gui.view.mmu.showClimate ?? true
    }

    get showClimateIcons(): boolean {
        return this.numGates > 2
    }

    get unitHeaterObj(): MmuFilamentHeater | undefined {
        const name = this.resolvePerGateName(
            this.mmuMachineUnit?.filament_heaters,
            this.mmuMachineUnit?.filament_heater
        )
        return this.heaterObj(name)
    }

    private heaterObj(name: string | undefined): MmuFilamentHeater | undefined {
        if (!name) return undefined
        return this.$store.state.printer[name] as MmuFilamentHeater | undefined
    }

    get unitClimateSensorObj(): MmuEnvironmentSensor | undefined {
        const fullname = this.resolvePerGateName(
            this.mmuMachineUnit?.environment_sensors,
            this.mmuMachineUnit?.environment_sensor
        )
        return this.environmentSensorObj(fullname)
    }

    private environmentSensorObj(fullname: string | undefined): MmuEnvironmentSensor | undefined {
        if (!fullname) return undefined
        const parts = fullname.split(' ')
        if (parts.length !== 2) return undefined
        const name = parts[1]

        for (const key of additionalSensors) {
            const objectName = `${key} ${name}`
            if (!(objectName in this.$store.state.printer)) continue

            return this.$store.state.printer[objectName] as MmuEnvironmentSensor
        }

        return undefined
    }

    get hasPerGateClimateSensors() {
        return !!this.mmuMachineUnit?.environment_sensors
    }

    get hasPerGateHeaters() {
        return !!this.mmuMachineUnit?.filament_heaters
    }

    get unitDryingCycle(): boolean {
        const start = this.firstGateNumber
        const end = this.firstGateNumber + this.numGates

        return this.dryingState.slice(start, end).some((state) => state === 'active' || state === 'queued')
    }

    get dryingState() {
        return this.mmu?.drying_state ?? []
    }

    get showPerGateReport(): boolean {
        return (this.hasPerGateHeaters || this.hasPerGateClimateSensors) && this.showDetails
    }

    private generatePerGateReport(): string {
        const sensors = this.mmuMachineUnit?.environment_sensors
        const heaters = this.mmuMachineUnit?.filament_heaters
        const isDrying = this.unitDryingCycle

        const gateLabel = this.$t('Panels.MmuPanel.Gate').toString()
        const dryingLabel = this.$t('Panels.MmuPanel.Drying').toString()
        const heaterLabel = this.$t('Panels.MmuPanel.Heater').toString()
        const queued = this.$t('Panels.MmuPanel.DryingQueued').toString()
        const complete = this.$t('Panels.MmuPanel.DryingComplete').toString()
        const cancelled = this.$t('Panels.MmuPanel.DryingCancelled').toString()

        const lines: string[] = []
        for (let i = 0; i < this.numGates; i++) {
            const gate = this.firstGateNumber + i
            const parts: string[] = []

            const sensorObj = this.environmentSensorObj(this.stripQuotes(sensors?.[i]))
            if (sensorObj) {
                const h = this.humidity(sensorObj)
                const t = this.temperature(sensorObj)
                if (h || t) parts.push([h, t].filter(Boolean).join('/'))
            }

            const heaterObj = this.heaterObj(this.stripQuotes(heaters?.[i]))
            if (heaterObj) {
                const state = this.dryingState?.[gate]
                if (isDrying) {
                    if (state === 'active') parts.push(`${dryingLabel}: ${this.target(heaterObj) ?? ''}`.trim())
                    else if (state === 'queued') parts.push(queued)
                    else if (state === 'complete') parts.push(complete)
                    else if (state === 'cancelled') parts.push(cancelled)
                    else parts.push(`${heaterLabel}: ${this.target(heaterObj) ?? ''}`.trim())
                } else {
                    parts.push(`${heaterLabel}: ${this.target(heaterObj) ?? ''}`.trim())
                }
            }

            lines.push(`${gateLabel} ${gate}: ${parts.join(', ')}`)
        }

        return lines.join('\n')
    }

    private formatMetric(
        obj: MmuClimateMetric | undefined,
        key: 'humidity' | 'temperature' | 'target',
        suffix: string
    ): string | undefined {
        const value = obj?.[key]
        return typeof value === 'number' ? `${value.toFixed(0)}${suffix}` : undefined
    }

    private humidity(obj: MmuClimateMetric | undefined) {
        return this.formatMetric(obj, 'humidity', '%')
    }

    private temperature(obj: MmuClimateMetric | undefined) {
        return this.formatMetric(obj, 'temperature', '°C')
    }

    private target(obj: MmuClimateMetric | undefined) {
        return this.formatMetric(obj, 'target', '°C')
    }

    private resolvePerGateName(perGate: string[] | undefined, single: string | undefined) {
        if (perGate) {
            const start = this.firstGateNumber
            const end = start + this.numGates
            if (this.mmuGate < start || this.mmuGate >= end) return undefined
            return this.stripQuotes(perGate[this.mmuGate - start])
        }
        return this.stripQuotes(single)
    }

    private stripQuotes(v?: string) {
        return v?.replace(/^"(.*)"$/, '$1')
    }

    get unitHeaterIcon() {
        if (this.unitDryingCycle) return mdiRotateOrbit

        if (this.hasPerGateHeaters) {
            // Check all heaters on unit
            const heaters = this.mmuMachineUnit?.filament_heaters
            for (let i = 0; i < this.numGates; i++) {
                const target = this.heaterObj(this.stripQuotes(heaters?.[i]))?.target
                if (typeof target === 'number' && target > 0) return mdiHeatingCoil
            }
        } else if (this.unitHeaterTemp) return mdiHeatingCoil

        return undefined
    }

    get unitClimateHumidity() {
        if (this.hasPerGateClimateSensors && !this.unitClimateSensorObj) return '...'
        if (!this.unitClimateSensorObj) return undefined
        return this.formatMetric(this.unitClimateSensorObj, 'humidity', '%')
    }

    get unitClimateTemp() {
        if (this.hasPerGateClimateSensors && !this.unitClimateSensorObj) return '...'
        if (!this.unitClimateSensorObj) return undefined
        const value = this.formatMetric(this.unitClimateSensorObj, 'temperature', '°C')
        return value ? (this.hasPerGateClimateSensors ? `${value} ...` : value) : undefined
    }

    get unitHeaterTemp() {
        if (!this.unitHeaterObj && this.mmuGate >= 0) return undefined
        if (!this.unitHeaterObj && this.hasPerGateHeaters) return '...'
        const raw = this.unitHeaterObj?.target
        if (typeof raw !== 'number' || raw <= 0) return undefined
        const value = this.formatMetric(this.unitHeaterObj, 'target', '°C')
        return value ? (this.hasPerGateHeaters ? `${value} ...` : value) : undefined
    }

    get mmuVendor() {
        return this.mmuMachineUnit?.vendor ?? 'Unknown'
    }

    get logoHeight() {
        if (squareLogoVendors.includes(this.mmuVendor)) return this.spoolWidth - 16

        return this.spoolWidth - 8
    }

    get logoClasses() {
        if (squareLogoVendors.includes(this.mmuVendor)) return ['my-1']

        return []
    }

    get logo() {
        const baseIcon = this.getBaseIcon(this.mmuVendor)
        const themeVariants = mmuThemeIcons[this.mmuVendor]

        if (!themeVariants) return baseIcon

        const isDark = this.$vuetify.theme.dark
        const themeIcon = isDark ? themeVariants.dark : themeVariants.light

        return themeIcon ?? baseIcon
    }

    private getBaseIcon(vendor: string) {
        switch (vendor) {
            case '3MS':
                return mmuIcon3MS

            case 'AngryBeaver':
                return mmuIconAngryBeaver

            case 'BoxTurtle':
                return mmuIconBoxTurtle

            case 'EMU':
                return mmuIconEmu

            case 'ERCF':
                return mmuIconErcf

            case 'KMS':
                return mmuIconKms

            case 'MMX':
                return mmuIconMmx

            case 'NightOwl':
                return mmuIconNightOwl

            case 'QuattroBox':
                return mmuIconQuattroBox

            case 'Tradrack':
                return mmuIconTradrack

            case 'VVD':
                return mmuIconVvd

            default:
                return mmuIconHappyHare
        }
    }
}
</script>

<style scoped>
.mmu-unit-footer {
    background: #2c2c2c;
    border-radius: 0 0 8px 8px;
}

html.theme--light .mmu-unit-footer {
    background: #f0f0f0;
}

.opacity-70 {
    opacity: 0.7;
}

.zindex-4 {
    z-index: 4;
}
</style>
