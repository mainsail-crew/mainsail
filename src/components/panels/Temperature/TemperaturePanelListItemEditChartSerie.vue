<template>
    <v-row>
        <v-col class="py-1">
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
import { capitalize } from '@/plugins/helpers'

const props = defineProps<{
    objectName: string
    serieName: string
}>()

const store = useStore()
const { t } = useI18n()

const value = computed(() =>
    store.getters['gui/getDatasetValue']({ name: props.objectName, type: props.serieName })
)

function setValue(newVal: any) {
    store.dispatch('gui/setChartDatasetStatus', {
        objectName: props.objectName,
        dataset: props.serieName,
        value: newVal,
    })
}

const formatSerieName = computed(() => capitalize(props.serieName))

const label = computed(() =>
    t('Panels.TemperaturePanel.ShowNameInChart', {
        name: formatSerieName.value,
    })
)
</script>
