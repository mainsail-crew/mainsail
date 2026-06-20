<template>
    <v-tooltip :disabled="!showPerGateReport" top open-delay="500">
        <template #activator="{ on, attrs }">
            <div class="d-flex" v-bind="attrs" v-on="on">
                <span v-if="unitClimateHumidity" class="d-inline-flex align-center mr-1">
                    <v-icon v-if="showClimateIcons" size="18" class="blue--text ml-n1">{{ mdiWater }}</v-icon>
                    {{ unitClimateHumidity }}
                </span>
                <span v-if="unitClimateTemp" class="d-inline-flex align-center mr-2">
                    <v-icon v-if="showClimateIcons" size="18" class="deep-orange--text">{{ mdiThermometer }}</v-icon>
                    {{ unitClimateTemp }}
                </span>
                <span v-if="unitHeaterIcon" class="d-inline-flex align-center ml-auto">
                    <v-icon size="22" class="red--text">{{ unitHeaterIcon }}</v-icon>
                    {{ unitHeaterTemp }}
                </span>
            </div>
        </template>
        <div>
            <div v-for="row in perGateReport" :key="row.gate">
                {{ $t('Panels.MmuPanel.Gate') }} {{ row.gate }}: {{ row.parts.join(', ') }}
            </div>
        </div>
    </v-tooltip>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { MmuEnvironmentSensor, MmuFilamentHeater, MmuMachineUnit } from '@/components/mixins/mmu'
import { mdiWater, mdiThermometer, mdiHeatingCoil, mdiRotateOrbit } from '@mdi/js'
import { additionalSensors } from '@/store/variables'

// A filament heater and an environment sensor share the same numeric metrics we read for display.
type MmuClimateMetric = Partial<MmuFilamentHeater & MmuEnvironmentSensor>

interface MmuGateReportRow {
    gate: number
    parts: string[]
}

@Component
export default class MmuUnitFooterClimate extends Mixins(BaseMixin, MmuMixin) {
    mdiWater = mdiWater
    mdiThermometer = mdiThermometer

    @Prop({ required: true }) readonly mmuMachineUnit!: MmuMachineUnit

    get numGates() {
        return this.mmuMachineUnit?.num_gates ?? 0
    }

    get firstGateNumber() {
        return this.mmuMachineUnit?.first_gate ?? 0
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

    get unitClimateSensorObj(): MmuEnvironmentSensor | undefined {
        const fullname = this.resolvePerGateName(
            this.mmuMachineUnit?.environment_sensors,
            this.mmuMachineUnit?.environment_sensor
        )

        return this.environmentSensorObj(fullname)
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
        return this.hasPerGateHeaters || this.hasPerGateClimateSensors
    }

    get perGateReport(): MmuGateReportRow[] {
        if (!this.showPerGateReport) return []

        const sensors = this.mmuMachineUnit?.environment_sensors
        const heaters = this.mmuMachineUnit?.filament_heaters
        const isDrying = this.unitDryingCycle

        const rows: MmuGateReportRow[] = []
        for (let i = 0; i < this.numGates; i++) {
            const gate = this.firstGateNumber + i
            const parts: string[] = []

            const sensorObj = this.environmentSensorObj(this.stripQuotes(sensors?.[i]))
            if (sensorObj) {
                const h = this.formatMetric(sensorObj, 'humidity', '%')
                const t = this.formatMetric(sensorObj, 'temperature', '°C')
                if (h || t) parts.push([h, t].filter(Boolean).join('/'))
            }

            const heaterObj = this.heaterObj(this.stripQuotes(heaters?.[i]))
            if (heaterObj) {
                parts.push(this.heaterPartText(heaterObj, isDrying ? this.dryingState?.[gate] : undefined))
            }

            rows.push({ gate, parts })
        }

        return rows
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

    environmentSensorObj(fullname: string | undefined): MmuEnvironmentSensor | undefined {
        if (!fullname) return undefined

        const settings = this.$store.state.printer.configfile?.settings ?? {}
        const sensorSettings = settings[fullname.toLowerCase()] ?? {}
        const sensorType = (sensorSettings.sensor_type ?? '').toLowerCase()

        // return sensor object itself, to display just temp for normal sensors
        if (!additionalSensors.includes(sensorType)) {
            return this.$store.state.printer[fullname] ?? undefined
        }

        const parts = fullname.split(' ')
        if (parts.length !== 2) return undefined
        const name = parts[1]
        const sensorObjectName = `${sensorType} ${name}`

        let printerObj = this.$store.state.printer[sensorObjectName] ?? undefined
        if (!printerObj && sensorType.startsWith('aht')) {
            const fallbackObjectName = `aht10 ${name}`
            printerObj = this.$store.state.printer[fallbackObjectName] ?? undefined
        }

        return printerObj
    }

    heaterPartText(heaterObj: MmuFilamentHeater, state: string | undefined): string {
        const target = this.formatMetric(heaterObj, 'target', '°C') ?? '--'
        switch (state) {
            case 'active':
                return `${this.$t('Panels.MmuPanel.Drying')}: ${target}`
            case 'queued':
                return this.$t('Panels.MmuPanel.DryingQueued').toString()
            case 'complete':
                return this.$t('Panels.MmuPanel.DryingComplete').toString()
            case 'cancelled':
                return this.$t('Panels.MmuPanel.DryingCancelled').toString()
            default:
                return `${this.$t('Panels.MmuPanel.Heater')}: ${target}`
        }
    }

    heaterObj(name: string | undefined): MmuFilamentHeater | undefined {
        if (!name) return undefined
        return this.$store.state.printer[name] as MmuFilamentHeater | undefined
    }

    formatMetric(
        obj: MmuClimateMetric | undefined,
        key: 'humidity' | 'temperature' | 'target',
        suffix: string
    ): string | undefined {
        const value = obj?.[key]
        return typeof value === 'number' ? `${value.toFixed(0)}${suffix}` : undefined
    }

    resolvePerGateName(perGate: string[] | undefined, single: string | undefined) {
        if (!perGate) return this.stripQuotes(single)

        const start = this.firstGateNumber
        const end = start + this.numGates
        if (this.mmuGate < start || this.mmuGate >= end) return undefined
        return this.stripQuotes(perGate[this.mmuGate - start])
    }

    stripQuotes(v?: string) {
        return v?.replace(/^"(.*)"$/, '$1')
    }
}
</script>
