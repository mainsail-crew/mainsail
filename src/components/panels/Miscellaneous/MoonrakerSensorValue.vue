<template>
    <div class="d-flex w-100 flex-row align-center">
        <v-icon small left>{{ unitToSymbol(unit) }}</v-icon>
        <span class="flex-grow-1">{{ name }}:</span>
        <span>{{ output }}</span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { convertName, unitToSymbol } from '@/plugins/helpers'

const props = defineProps<{
    sensor: string
    valueName: string
}>()

const store = useStore()

const sensorData = computed(() => {
    const sensors = store.state.server.sensor.sensors
    if (!(props.sensor in sensors)) return {}
    return sensors[props.sensor].values
})

const sensorConfig = computed(() => {
    const name = `sensor ${props.sensor}`
    const serverConfig = store.state.server.config?.config ?? {}
    if (!(name in serverConfig)) return {}
    return serverConfig[name]
})

const parameterConfig = computed(() => {
    const name = `parameter_${props.valueName}`
    if (!(name in sensorConfig.value)) return {}
    return sensorConfig.value[name]
})

const unit = computed(() => {
    if (!('units' in parameterConfig.value)) return null
    return parameterConfig.value.units
})

const value = computed(() => {
    if (!(props.valueName in sensorData.value)) return '--'
    return Math.round(sensorData.value[props.valueName] * 1000) / 1000
})

const output = computed(() => {
    if (unit.value === null) return value.value
    return `${value.value} ${unit.value}`
})

const name = computed(() => convertName(props.valueName))
</script>
