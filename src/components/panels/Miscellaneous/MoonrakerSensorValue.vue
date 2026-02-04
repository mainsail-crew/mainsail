<template>
    <div class="d-flex w-100 flex-row align-center">
        <v-icon small left>{{ unitToSymbol(unit) }}</v-icon>
        <span class="flex-grow-1">{{ name }}:</span>
        <span>{{ output }}</span>
    </div>
</template>

<script lang="ts">
import { convertName, unitToSymbol } from '@/plugins/helpers'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class MoonrakerSensorValue extends Mixins(BaseMixin) {
    convertName = convertName
    unitToSymbol = unitToSymbol

    @Prop({ type: String, required: true }) declare readonly sensor: string
    @Prop({ type: String, required: true }) declare readonly valueName: string

    get sensorData() {
        const sensors = this.$store.state.server.sensor.sensors
        if (!(this.sensor in sensors)) return {}

        return sensors[this.sensor].values
    }

    get sensorConfig() {
        return this.$store.getters['server/getConfigSection'](`sensor ${this.sensor}`, {})
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
}
</script>
