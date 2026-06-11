<template>
    <e-chart
        ref="historyPrinttimeAvg"
        v-observe-visibility="visibilityChanged"
        :option="chartOptions"
        :init-options="{ renderer: 'svg' }"
        style="height: 175px; width: 100%"></e-chart>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ECharts } from 'echarts/core'
import type { ECBasicOption } from 'echarts/types/dist/shared.d'
import type { EChartRef } from '@/types/echarts'
import { useTheme } from '@/composables/useTheme'
import { useBase } from '@/composables/useBase'
import { useHistory } from '@/composables/useHistory'
import { ServerHistoryStateJob } from '@/store/server/history/types'

const { t } = useI18n()
const { fgColorHi, fgColorMid, fgColorLow, fgColorFaint } = useTheme()
const { allJobs, selectedJobs } = useHistory()

const historyPrinttimeAvg = ref<EChartRef | undefined>()

const chartOptions = computed<ECBasicOption>(() => ({
    animation: false,
    grid: {
        top: 25,
        right: 40,
        bottom: 30,
        left: 40,
    },
    tooltip: {
        trigger: 'item',
        borderWidth: 0,
    },
    xAxis: {
        type: 'category',
        data: ['0-2h', '2-6h', '6-12h', '12-24h', '>24h'],
        splitLine: {
            show: true,
            lineStyle: {
                color: fgColorFaint.value,
            },
        },
        axisLabel: {
            color: fgColorLow.value,
            margin: 10,
        },
    },
    yAxis: {
        name: t('History.HistoryPrinttimeAVG'),
        type: 'value',
        minInterval: 10,
        maxInterval: 100,
        nameLocation: 'end',
        nameGap: 5,
        nameTextStyle: {
            color: fgColorLow.value,
            align: 'left',
        },
        splitLine: {
            lineStyle: {
                color: fgColorLow.value,
            },
        },
        axisLabel: {
            color: fgColorLow.value,
            formatter: '{value}',
            showMinLabel: true,
            margin: 5,
        },
        axisLine: {
            show: true,
            lineStyle: {
                color: fgColorLow.value,
            },
        },
    },
    series: [
        {
            type: 'bar',
            data: printtimeAvgArray.value,
            itemStyle: {
                color: '#BDBDBD',
            },
        },
    ],
}))

const printtimeAvgArray = computed<number[]>(() => {
    const output: number[] = [0, 0, 0, 0, 0]
    const startDate = new Date(new Date().getTime() - 60 * 60 * 24 * 14 * 1000)

    let jobsFiltered = [
        ...allJobs.value.filter(
            (job: ServerHistoryStateJob) =>
                new Date(job.start_time * 1000) >= startDate && job.status === 'completed'
        ),
    ]
    if (selectedJobs.value.length)
        jobsFiltered = [
            ...selectedJobs.value.filter(
                (job: ServerHistoryStateJob) =>
                    new Date(job.start_time * 1000) >= startDate && job.status === 'completed'
            ),
        ]

    if (jobsFiltered.length) {
        const hours = (duration: number) => duration / 3600

        jobsFiltered.forEach((current) => {
            const printHours = hours(current.print_duration)

            if (printHours > 0 && printHours <= 2) output[0]++
            else if (printHours <= 6) output[1]++
            else if (printHours <= 12) output[2]++
            else if (printHours <= 24) output[3]++
            else output[4]++
        })
    }

    return output
})

const chart = computed<ECharts | null>(() => historyPrinttimeAvg.value?.chart ?? null)

onBeforeUnmount(() => {
    if (typeof window === 'undefined') return
    if (chart.value) chart.value.dispose()
})

watch(printtimeAvgArray, (newVal: number[]) => {
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
