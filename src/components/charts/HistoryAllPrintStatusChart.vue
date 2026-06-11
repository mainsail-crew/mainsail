<template>
    <e-chart
        ref="historyAllPrintStatus"
        v-observe-visibility="visibilityChanged"
        :option="chartOptions"
        :autoresize="true"
        :init-options="{ renderer: 'svg' }"
        class="w-100"
        style="height: 200px" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useBase } from '@/composables/useBase'
import { useTheme } from '@/composables/useTheme'
import { useHistoryStats } from '@/composables/useHistoryStats'
import type { ECBasicOption } from 'echarts/types/dist/shared.d'
import type { ECharts } from 'echarts/core'
import type { EChartRef } from '@/types/echarts'
import { formatPrintTime } from '@/plugins/helpers'
import { HistoryStatsValueNames, ServerHistoryStateAllPrintStatusEntry } from '@/store/server/history/types'

const props = defineProps<{
    valueName?: HistoryStatsValueNames
}>()

const { fgColorHi } = useTheme()
const aggregated = useHistoryStats(props.valueName ?? 'jobs')
const { groupedPrintStatusArray } = aggregated

const historyAllPrintStatus = ref<EChartRef | undefined>()

function getNumericTooltipValue(value: unknown): number {
    const rawValue = Array.isArray(value) ? value[0] : value
    const numericValue = Number(rawValue)

    return Number.isFinite(numericValue) ? numericValue : 0
}

const chartOptions = computed<ECBasicOption>(() => ({
    animation: false,
    grid: {
        top: 10,
        right: 0,
        bottom: 0,
        left: 10,
    },
    tooltip: {
        trigger: 'item',
        borderWidth: 0,
        valueFormatter: (value: unknown) => {
            const numericValue = getNumericTooltipValue(value)

            if (props.valueName === 'filament') {
                if (numericValue > 1000) return Math.round(numericValue / 1000).toString() + ' m'

                return numericValue.toString() + ' mm'
            }

            if (props.valueName === 'time') {
                return formatPrintTime(numericValue, false)
            }

            return numericValue.toString()
        },
    },
    series: [
        {
            type: 'pie',
            data: groupedPrintStatusArray.value,
            avoidLabelOverlap: false,
            minAngle: 5,
            radius: ['35%', '60%'],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
            },
            label: {
                color: fgColorHi.value,
            },
        },
    ],
}))

const chart = computed<ECharts | null>(() => historyAllPrintStatus.value?.chart ?? null)

onBeforeUnmount(() => {
    if (typeof window === 'undefined') return

    chart.value?.dispose()
})

watch(groupedPrintStatusArray, (newVal: ServerHistoryStateAllPrintStatusEntry[]) => {
    chart.value?.setOption(
        {
            series: {
                data: newVal,
            },
        },
        false,
        true
    )
})

function visibilityChanged(isVisible: boolean) {
    if (isVisible) chart.value?.resize()
}
</script>
