<template>
    <e-chart
        ref="historyFilamentUsage"
        v-observe-visibility="visibilityChanged"
        :option="chartOptions"
        :autoresize="true"
        :init-options="{ renderer: 'svg' }"
        style="height: 175px; width: 100%"></e-chart>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import type { ECharts } from 'echarts/core'
import type { ECBasicOption, TopLevelFormatterParams } from 'echarts/types/dist/shared.d'
import type { EChartRef } from '@/types/echarts'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useHistory } from '@/composables/useHistory'
import { useBase } from '@/composables/useBase'
import type { ServerHistoryStateJob } from '@/store/server/history/types'

const { t } = useI18n()
const { fgColorHi, fgColorMid, fgColorLow } = useTheme()
const { formatDate } = useBase()
const { allJobs, selectedJobs } = useHistory()

const historyFilamentUsage = ref<EChartRef | undefined>()

function formatTooltip(params: TopLevelFormatterParams): string {
    const entry = Array.isArray(params) ? params[0] : params
    if (!Array.isArray(entry?.data) || typeof entry.data[0] !== 'number' || typeof entry.data[1] !== 'number')
        return ''

    const marker = typeof entry.marker === 'string' ? entry.marker : ''
    const outputDate = formatDate(entry.data[0])
    const outputValue = Math.round(entry.data[1] * 10) / 10

    return `${marker}${outputDate}: ${outputValue}m`
}

const chartOptions = computed<ECBasicOption>(() => ({
    animation: false,
    grid: {
        top: 25,
        right: 40,
        bottom: 30,
        left: 40,
    },
    tooltip: {
        trigger: 'axis',
        borderWidth: 0,
        formatter: (params: TopLevelFormatterParams) => formatTooltip(params),
    },
    xAxis: {
        type: 'time',
        min: new Date().setHours(0, 0, 0) - 60 * 60 * 24 * 14 * 1000,
        max: new Date().setHours(0, 0, 0),
        minInterval: 60 * 60 * 24 * 1000,
        splitLine: {
            show: true,
            lineStyle: {
                color: fgColorLow.value,
            },
        },
        axisLabel: {
            color: fgColorLow.value,
            margin: 10,
        },
    },
    yAxis: {
        name: t('History.HistoryFilamentUsage'),
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
                color: fgColorMid.value,
            },
        },
    },
    color: ['#BDBDBD'],
    series: [
        {
            type: 'bar',
            data: filamentUsageArray.value,
            showSymbol: false,
        },
    ],
}))

const filamentUsageArray = computed<[number, number][]>(() => {
    const output: [number, number][] = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 14)
    startDate.setHours(0, 0, 0, 0)

    let jobsFiltered = [
        ...allJobs.value.filter(
            (job: ServerHistoryStateJob) => new Date(job.start_time * 1000) >= startDate && job.filament_used > 0
        ),
    ]
    if (selectedJobs.value.length)
        jobsFiltered = [
            ...selectedJobs.value.filter(
                (job: ServerHistoryStateJob) =>
                    new Date(job.start_time * 1000) >= startDate && job.filament_used > 0
            ),
        ]

    for (let i = 0; i <= 14; i++) {
        const tmpDate = new Date(startDate.getTime())
        tmpDate.setDate(tmpDate.getDate() + i)
        tmpDate.setHours(0, 0, 0, 0)

        output.push([tmpDate.getTime(), 0])
    }

    if (jobsFiltered.length) {
        jobsFiltered.forEach((current) => {
            const currentStartDate = new Date(current.start_time * 1000).setHours(0, 0, 0, 0)
            const index = output.findIndex((element) => element[0] === currentStartDate)
            if (index !== -1) output[index][1] += Math.round(current.filament_used) / 1000
        })
    }

    return output.sort((a, b) => {
        return b[0] - a[0]
    })
})

const chart = computed<ECharts | null>(() => historyFilamentUsage.value?.chart ?? null)

onBeforeUnmount(() => {
    if (typeof window === 'undefined') return
    if (chart.value) chart.value.dispose()
})

watch(filamentUsageArray, (newVal: [number, number][]) => {
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
