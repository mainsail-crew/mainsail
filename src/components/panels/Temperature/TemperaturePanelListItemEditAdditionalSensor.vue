<template>
    <v-row>
        <v-col class="col-12 py-1">
            <v-checkbox
                :model-value="value"
                @update:model-value="setValue"
                :label="label"
                hide-details
                class="mt-0" />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    objectName: string
    additionalSensor: string
}>()

const store = useStore()
const { t } = useI18n()

const value = computed(() =>
    store.getters['gui/getDatasetAdditionalSensorValue']({
        name: props.objectName,
        type: props.additionalSensor,
    })
)

function setValue(newVal: any) {
    store.dispatch('gui/setDatasetAdditionalSensorStatus', {
        objectName: props.objectName,
        dataset: props.additionalSensor,
        value: newVal,
    })
}

const label = computed(() =>
    t('Panels.TemperaturePanel.ShowNameInList', {
        name: props.additionalSensor,
    })
)
</script>
