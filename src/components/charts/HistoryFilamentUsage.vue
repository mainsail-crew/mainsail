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
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import type { ECharts } from 'echarts/core'
import ThemeMixin from '../mixins/theme'

@Component({})
export default class HistoryPrinttimeAvg extends Mixins(BaseMixin, ThemeMixin) {
    declare $refs: {
        historyFilamentUsage: any
    }

    get chartOptions(): any {
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
                formatter: (datasets: any) => {
                    let output = ''

                    if (datasets.length) {
                        output = datasets[0]['marker']
                        const outputTime = datasets[0]['axisValueLabel']
                        const a = outputTime.split(/[^0-9]/)
                        const outputTimeDate = new Date(a[0], a[1] - 1, a[2])
                        const outputValue = Math.round(datasets[0]['data'][1] * 10) / 10

                        output += outputTimeDate.toLocaleDateString() + ': ' + outputValue + 'm'
                    }

                    return output
                },
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

    get filamentUsageArray() {
        return this.$store.getters['server/history/getFilamentUsageArray']
    }

    get chart(): ECharts | null {
        return this.$refs.historyFilamentUsage?.chart ?? null
    }

    beforeDestroy() {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }

    @Watch('filamentUsageArray')
    filamentUsageArrayChanged(newVal: any) {
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
