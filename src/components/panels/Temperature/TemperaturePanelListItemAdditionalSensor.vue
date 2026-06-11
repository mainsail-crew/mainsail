<template>
    <div>
        <temperature-panel-list-item-additional-sensor-value
            v-for="keyName of additionalValues"
            :key="keyName"
            :printer-object="printerObject"
            :object-name="objectName"
            :key-name="keyName" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps<{
    objectName: string
    additionalObjectName: string
}>()

const store = useStore()

const printerObject = computed(() => {
    if (!(props.additionalObjectName in store.state.printer)) return {}
    return store.state.printer[props.additionalObjectName]
})

const additionalValues = computed(() => {
    if (props.objectName === 'z_thermal_adjust') return ['current_z_adjust']
    return Object.keys(printerObject.value).filter((key) => key !== 'temperature')
})
</script>
