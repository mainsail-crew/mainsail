<template>
    <v-table>
        <tbody>
            <history-all-print-status-table-item
                v-for="status in aggregated.printStatusArrayChart"
                :key="status.name"
                :item="status"
                :value-name="valueName" />
        </tbody>
    </v-table>
</template>

<script setup lang="ts">
import { useHistoryStats } from '@/composables/useHistoryStats'
import HistoryAllPrintStatusTableItem from '@/components/charts/HistoryAllPrintStatusTableItem.vue'
import { HistoryStatsValueNames } from '@/store/server/history/types'

const props = defineProps<{
    valueName?: HistoryStatsValueNames
}>()

const aggregated = useHistoryStats(props.valueName ?? 'jobs')
</script>
