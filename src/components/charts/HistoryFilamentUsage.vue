<template>
    <ECharts
        ref="historyFilamentUsage"
        :option="chartOptions"
        :init-options="{ renderer: 'svg' }"
        style="height: 175px; width: 100%;"
        v-observe-visibility="visibilityChanged"
    ></ECharts>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import {createComponent} from 'echarts-for-vue'
import * as echarts from 'echarts'
import {Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import {ECharts} from 'echarts/core'

@Component({
    components: {
        ECharts: createComponent({ echarts }),
    }
})
export default class HistoryPrinttimeAvg extends Mixins(BaseMixin) {
    $refs!: {
        historyFilamentUsage: any
    }

    private chartOptions: any = {
        darkMode: true,
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
                    const outputTimeDate = new Date (a[0],a[1]-1, a[2])
                    const outputValue = Math.round(datasets[0]['data'][1] * 10) / 10

                    output += outputTimeDate.toLocaleDateString()+': '+outputValue+'m'
                }

                return output
            }
        },
        xAxis: {
            type: 'time',
            min: new Date().setHours(0,0,0) - 60*60*24*14*1000,
            max: new Date().setHours(0,0,0),
            minInterval: 60*60*24*1000,
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.06)',
                },
            },
            axisLabel: {
                color: 'rgba(255, 255, 255, 0.24)',
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
                color: 'rgba(255, 255, 255, 0.24)',
                align: 'left',
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.12)',
                },
            },
            axisLabel: {
                color: 'rgba(255, 255, 255, 0.24)',
                formatter: '{value}',
                //rotate: 90,
                //showMaxLabel: false,
                showMinLabel: true,
                margin: 5,
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.12)',
                },
            }
        },
        color: ['#BDBDBD'],
        series: [{
            type: 'bar',
            data: [],
            showSymbol: false
        }]
    }

    get filamentUsageArray() {
        return this.$store.getters['server/history/getFilamentUsageArray']
    }

    get chart (): ECharts | null {
        const historyFilamentUsage = this.$refs.historyFilamentUsage
        return historyFilamentUsage?.inst ?? null
    }

    mounted() {
        this.chartOptions.series[0].data = this.filamentUsageArray
        this.chart?.setOption(this.chartOptions)

        window.addEventListener('resize', this.eventListenerResize)
    }

    destroyed() {
        window.removeEventListener('resize', this.eventListenerResize)
    }

    beforeDestroy() {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }

    @Watch('filamentUsageArray')
    filamentUsageArrayChanged(newVal: any) {
        this.chart?.setOption({
            series: {
                data: newVal
            }
        })
    }

    visibilityChanged (isVisible: boolean) {
        if (isVisible) this.chart?.resize()
    }

    eventListenerResize() {
        this.chart?.resize()
    }
}
</script>