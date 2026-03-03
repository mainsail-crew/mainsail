<template>
    <e-chart
        ref="historyFilamentUsage"
        v-observe-visibility="visibilityChanged"
        :option="chartOptions"
        :autoresize="true"
        :init-options="{ renderer: 'svg' }"
        style="height: 175px; width: 100%"></e-chart>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import type { ECharts } from 'echarts/core'
import type { CallbackDataParams, ECBasicOption, TopLevelFormatterParams } from 'echarts/types/dist/shared.d'
import ThemeMixin from '../mixins/theme'
import HistoryMixin from '@/components/mixins/history'
import { ServerHistoryStateJob } from '@/store/server/history/types'

interface HistoryFilamentUsageChartRef {
    chart?: ECharts
}

interface HistoryFilamentUsageTooltipData extends CallbackDataParams {
    marker: string
    axisValueLabel: string
    data: [number, number]
}

@Component
export default class HistoryPrinttimeAvg extends Mixins(BaseMixin, HistoryMixin, ThemeMixin) {
    @Ref('historyFilamentUsage') readonly historyFilamentUsage!: HistoryFilamentUsageChartRef | undefined

    private isHistoryFilamentUsageTooltipData(param: CallbackDataParams): param is HistoryFilamentUsageTooltipData {
        const tooltipParam = param as CallbackDataParams & {
            marker?: unknown
            axisValueLabel?: unknown
            data?: unknown
        }

        return (
            typeof tooltipParam.marker === 'string' &&
            typeof tooltipParam.axisValueLabel === 'string' &&
            Array.isArray(tooltipParam.data) &&
            tooltipParam.data.length >= 2 &&
            typeof tooltipParam.data[0] === 'number' &&
            typeof tooltipParam.data[1] === 'number'
        )
    }

    private formatTooltip(params: TopLevelFormatterParams): string {
        const datasets = (Array.isArray(params) ? params : [params]).filter(this.isHistoryFilamentUsageTooltipData)
        if (!datasets.length) return ''

        const dataset = datasets[0]
        const dateParts = dataset.axisValueLabel
            .split(/[^0-9]/)
            .filter(Boolean)
            .map((value) => parseInt(value, 10))
        if (dateParts.length < 3) return dataset.marker

        const outputTimeDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
        const outputValue = Math.round(dataset.data[1] * 10) / 10

        return dataset.marker + outputTimeDate.toLocaleDateString() + ': ' + outputValue + 'm'
    }

    get chartOptions(): ECBasicOption {
        return {
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
                formatter: (params: TopLevelFormatterParams) => this.formatTooltip(params),
            },
            xAxis: {
                type: 'time',
                min: new Date().setHours(0, 0, 0) - 60 * 60 * 24 * 14 * 1000,
                max: new Date().setHours(0, 0, 0),
                minInterval: 60 * 60 * 24 * 1000,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: this.fgColorLow,
                    },
                },
                axisLabel: {
                    color: this.fgColorLow,
                    margin: 10,
                },
            },
            yAxis: {
                name: this.$t('History.HistoryFilamentUsage'),
                type: 'value',
                minInterval: 10,
                maxInterval: 100,
                nameLocation: 'end',
                nameGap: 5,
                nameTextStyle: {
                    color: this.fgColorLow,
                    align: 'left',
                },
                splitLine: {
                    lineStyle: {
                        color: this.fgColorLow,
                    },
                },
                axisLabel: {
                    color: this.fgColorLow,
                    formatter: '{value}',
                    //rotate: 90,
                    //showMaxLabel: false,
                    showMinLabel: true,
                    margin: 5,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: this.fgColorMid,
                    },
                },
            },
            color: ['#BDBDBD'],
            series: [
                {
                    type: 'bar',
                    data: this.filamentUsageArray,
                    showSymbol: false,
                },
            ],
        }
    }

    get filamentUsageArray(): [number, number][] {
        const output: [number, number][] = []
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 14)
        startDate.setHours(0, 0, 0, 0)

        let jobsFiltered = [
            ...this.allJobs.filter(
                (job: ServerHistoryStateJob) => new Date(job.start_time * 1000) >= startDate && job.filament_used > 0
            ),
        ]
        if (this.selectedJobs.length)
            jobsFiltered = [
                ...this.selectedJobs.filter(
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
    }

    get chart(): ECharts | null {
        return this.historyFilamentUsage?.chart ?? null
    }

    beforeDestroy() {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }

    @Watch('filamentUsageArray')
    filamentUsageArrayChanged(newVal: [number, number][]) {
        this.chart?.setOption(
            {
                series: {
                    data: newVal,
                },
            },
            false,
            true
        )
    }

    visibilityChanged(isVisible: boolean) {
        if (isVisible) this.chart?.resize()
    }
}
</script>
