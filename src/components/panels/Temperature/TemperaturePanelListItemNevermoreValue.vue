<template>
    <div v-if="isVisible">
        <v-tooltip top :disabled="disableTooltip">
            <template #activator="{ props }">
                <span :style="cssStyle" v-bind="props">{{ formatValue }}</span>
            </template>
            <span>
                {{ $t('Panels.TemperaturePanel.Max') }}: {{ formatValue_max }}
                <br />
                {{ $t('Panels.TemperaturePanel.Min') }}: {{ formatValue_min }}
            </span>
        </v-tooltip>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps<{
    printerObject: { [key: string]: number }
    objectName: string
    keyName: string
    small?: boolean
}>()

const store = useStore()

const cssStyle = computed(() => {
    const style: Record<string, string> = { cursor: 'default', fontSize: '1em' }
    if (props.small !== false) style.fontSize = '0.8em'
    return style
})

const value = computed(() => {
    const val = props.printerObject[props.keyName] ?? null
    if (isNaN(val)) return null
    return val
})

const intake_value = computed(() => {
    const name = `intake_${props.keyName}`
    return props.printerObject[name] ?? null
})

const intake_value_min = computed(() => {
    const name = `intake_${props.keyName}_min`
    return props.printerObject[name] ?? null
})

const intake_value_max = computed(() => {
    const name = `intake_${props.keyName}_max`
    return props.printerObject[name] ?? null
})

const exhaust_value = computed(() => {
    const name = `exhaust_${props.keyName}`
    return props.printerObject[name] ?? null
})

const exhaust_value_min = computed(() => {
    const name = `exhaust_${props.keyName}_min`
    return props.printerObject[name] ?? null
})

const exhaust_value_max = computed(() => {
    const name = `exhaust_${props.keyName}_max`
    return props.printerObject[name] ?? null
})

const unit = computed(() => {
    switch (props.keyName) {
        case 'temperature':
            return '°C'
        case 'pressure':
            return 'hPa'
        case 'humidity':
            return '%'
    }
    return null
})

const digits = computed(() => ['gas', 'pressure'].includes(props.keyName) ? 0 : 1)

const formatValue = computed(() => getFormatedValue(intake_value.value, exhaust_value.value))

const formatValue_min = computed(() => getFormatedValue(intake_value_min.value, exhaust_value_min.value))

const formatValue_max = computed(() => getFormatedValue(intake_value_max.value, exhaust_value_max.value))

function getFormatedValue(intake: number | null, exhaust: number | null): string {
    let intake_value_str = intake?.toFixed(digits.value)
    let exhaust_value_str = exhaust?.toFixed(digits.value)
    if (intake_value.value === null) intake_value_str = '--'
    if (exhaust_value.value === null) exhaust_value_str = '--'
    if (unit.value === null) return `${intake_value_str} > ${exhaust_value_str}`
    return `${intake_value_str} ${unit.value} > ${exhaust_value_str} ${unit.value}`
}

const disableTooltip = computed(() =>
    intake_value_min.value === null ||
    exhaust_value_min.value === null ||
    intake_value_max.value === null ||
    exhaust_value_max.value === null
)

const guiSetting = computed(() =>
    store.getters['gui/getDatasetAdditionalSensorValue']({
        name: props.objectName,
        sensor: props.keyName,
    })
)

const isVisible = computed(() => {
    if (intake_value.value === null && exhaust_value.value === null) return false
    return guiSetting.value
})
</script>
