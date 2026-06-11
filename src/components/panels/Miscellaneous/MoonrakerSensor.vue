<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="mb-1 d-block _moonraker-sensor-subheader">
                    {{ displayName }}
                </v-subheader>
                <v-subheader class="d-block _moonraker-sensor-subheader">
                    <moonraker-sensor-value
                        v-for="(valueName, index) of valueNames"
                        :key="'moonraker_sensor_value_' + index"
                        :sensor="name"
                        :value-name="valueName" />
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { convertName } from '@/plugins/helpers'

const props = defineProps<{
    name: string
}>()

const store = useStore()

const sensor = computed(() => {
    const sensors = store.state.server.sensor.sensors
    if (!(props.name in sensors)) return undefined
    return sensors[props.name]
})

const displayName = computed(() => {
    if (sensor.value === undefined || sensor.value?.friendly_name === props.name) {
        return convertName(props.name)
    }
    return sensor.value?.friendly_name
})

const valueNames = computed(() => Object.keys(sensor.value?.values ?? {}))
</script>

<style scoped>
._moonraker-sensor-subheader {
    height: auto;
}
</style>
