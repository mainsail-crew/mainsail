<template>
    <div v-if="isVisible">
        <small>{{ formatValue }}</small>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps<{
    printerObject: { [key: string]: number }
    objectName: string
    keyName: string
}>()

const store = useStore()

const value = computed(() => {
    const val = props.printerObject[props.keyName] ?? null
    if (isNaN(val)) return null
    return val
})

const formatValue = computed(() => {
    let val = value.value?.toFixed(1)
    if (value.value === null) val = '--'

    let unit: string | null = null
    switch (props.keyName) {
        case 'pressure':
            unit = 'hPa'
            break
        case 'humidity':
            unit = '%'
            break
        case 'current_z_adjust':
            unit = 'mm'
            break
    }

    if (props.keyName === 'current_z_adjust' && value.value) {
        val = value.value.toFixed(3)
        if (Math.abs(value.value) < 0.1) {
            val = Math.round(value.value * 1000).toString()
            unit = 'μm'
        }
    }

    return unit ? `${val} ${unit}` : val
})

const guiSetting = computed(() =>
    store.getters['gui/getDatasetAdditionalSensorValue']({
        name: props.objectName,
        sensor: props.keyName,
    })
)

const isVisible = computed(() => {
    if (value.value === null) return false
    return guiSetting.value
})
</script>
