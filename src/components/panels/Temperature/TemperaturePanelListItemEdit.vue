<template>
    <v-dialog :model-value="showDialog" @update:model-value="$emit('update:model-value', $event)" persistent :width="400">
        <panel :title="formatName" :icon="icon" card-class="temperature-edit-heater-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn :icon="mdiCloseThick" tile @click="closeDialog" />
            </template>
            <v-card-text class="pt-6">
                <temperature-panel-list-item-edit-chart-serie
                    v-for="dataset in chartSeries"
                    :key="dataset"
                    :object-name="objectName"
                    :serie-name="dataset" />
                <temperature-panel-list-item-edit-additional-sensor
                    v-for="additionalSensor in additionalValues"
                    :key="additionalSensor"
                    :object-name="objectName"
                    :additional-sensor="additionalSensor" />
                <v-row>
                    <v-col class="col-12 text-center pb-0">
                        <v-color-picker
                            hide-mode-switch
                            mode="hexa"
                            :model-value="color"
                            class="mx-auto"
                            @update:color="setChartColor" />
                    </v-col>
                </v-row>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { mdiCloseThick } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'

const props = defineProps<{
    showDialog: boolean
    objectName: string
    name: string
    additionalSensorName: string | null
    formatName: string
    icon: string
    color: string
}>()

const emit = defineEmits<{
    'update:model-value': [value: boolean]
}>()

const store = useStore()

const chartSeries = computed(() =>
    store.getters['printer/tempHistory/getSerieNames'](props.objectName) ?? []
)

const printerObjectAdditionalSensor = computed(() => {
    if (props.additionalSensorName === null || !(props.additionalSensorName in store.state.printer)) return {}
    return store.state.printer[props.additionalSensorName]
})

const additionalValues = computed(() => {
    if (props.objectName === 'z_thermal_adjust') return ['current_z_adjust']
    if (props.objectName.startsWith('nevermore')) return ['temperature', 'pressure', 'humidity', 'rpm']
    return Object.keys(printerObjectAdditionalSensor.value).filter((key) => key !== 'temperature')
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function setChartColor(value: string | { hex: string }): void {
    if (typeof value === 'object' && 'hex' in value) value = value.hex
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        store.dispatch('gui/setChartColor', {
            objectName: props.objectName,
            value,
        })
        store.dispatch('printer/tempHistory/setColor', { name: props.objectName, value })
    }, 500)
}

function closeDialog() {
    emit('update:model-value', false)
}
</script>
