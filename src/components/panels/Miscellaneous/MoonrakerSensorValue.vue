<template>
    <div class="d-flex w-100 flex-row align-center">
        <v-icon small left>{{ symbol }}</v-icon>
        <span class="flex-grow-1">{{ name }}:</span>
        <span>{{ output }}</span>
    </div>
</template>

<script lang="ts">
import { convertName } from '@/plugins/helpers'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiGauge, mdiLightningBoltOutline, mdiFlash, mdiThermometer, mdiMeterElectricOutline } from '@mdi/js'

@Component
export default class MoonrakerSensorValue extends Mixins(BaseMixin) {
    convertName = convertName

    @Prop({ type: String, required: true }) declare readonly sensor: string
    @Prop({ type: String, required: true }) declare readonly valueName: string

    mdiGauge = mdiGauge
    mdiLightningBoltOutline = mdiLightningBoltOutline
    mdiFlash = mdiFlash
    mdiThermometer = mdiThermometer
    mdiMeterElectricOutline = mdiMeterElectricOutline

    get sensorData() {
        const sensors = this.$store.state.server.sensor.sensors
        if (!(this.sensor in sensors)) return {}

        return sensors[this.sensor].values
    }

    get sensorConfig() {
        const name = `sensor ${this.sensor}`
        const serverConfig = this.$store.state.server.config?.config ?? {}
        if (!(name in serverConfig)) return {}

        return serverConfig[name]
    }

    get parameterConfig() {
        const name = `parameter_${this.valueName}`
        if (!(name in this.sensorConfig)) return {}

        return this.sensorConfig[name]
    }

    get unit() {
        if (!('units' in this.parameterConfig)) return null

        return this.parameterConfig.units
    }

    get value() {
        if (!(this.valueName in this.sensorData)) return '--'

        return Math.round(this.sensorData[this.valueName] * 1000) / 1000
    }

    get output() {
        if (this.unit === null) return this.value

        return `${this.value} ${this.unit}`
    }

    get name() {
        return this.convertName(this.valueName)
    }

    get symbol() {
        if (['wh', 'kwh', 'mwh', 'j'].includes(this.unit?.toLowerCase())) {
            return this.mdiLightningBoltOutline
        }

        if (['w', 'v'].includes(this.unit?.toLowerCase())) {
            return this.mdiFlash
        }

        if (this.unit?.toLowerCase() === 'a') {
            return this.mdiMeterElectricOutline
        }

        if (['°c', 'c', '°f', 'f', '°'].includes(this.unit?.toLowerCase())) {
            return this.mdiThermometer
        }

        return this.mdiGauge
    }
}
</script>
