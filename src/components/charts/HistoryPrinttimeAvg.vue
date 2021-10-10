<template>
    <ECharts
        ref="historyPrinttimeAvg"
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
        historyPrinttimeAvg: any
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
            trigger: 'item',
            borderWidth: 0,
        },
        xAxis: {
            type: 'category',
            data: ['0-2h', '2-6h', '6-12h', '12-24h', '>24h'],
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
            name: this.$t('History.HistoryPrinttimeAVG'),
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
        series: [{
            type: 'bar',
            data: [],
            itemStyle: {
                color: '#BDBDBD'
            }
        }]
    }

    get printtimeAvgArray() {
        return this.$store.getters['server/history/getPrinttimeAvgArray']
    }

    get chart (): ECharts | null {
        const historyPrinttimeAvg = this.$refs.historyPrinttimeAvg
        return historyPrinttimeAvg?.inst ?? null
    }

    mounted() {
        this.chartOptions.series[0].data = this.printtimeAvgArray
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

    @Watch('printtimeAvgArray')
    printtimeAvgArrayChanged(newVal: any) {
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