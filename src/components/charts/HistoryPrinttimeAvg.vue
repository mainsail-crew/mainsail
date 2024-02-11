<template>
    <e-chart
        ref="historyPrinttimeAvg"
        v-observe-visibility="visibilityChanged"
        :option="chartOptions"
        :init-options="{ renderer: 'svg' }"
        style="height: 175px; width: 100%"></e-chart>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import type { ECharts } from 'echarts/core'
import ThemeMixin from '../mixins/theme'

@Component({
    components: {},
})
export default class HistoryPrinttimeAvg extends Mixins(BaseMixin, ThemeMixin) {
    declare $refs: {
        historyPrinttimeAvg: any
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
                trigger: 'item',
                borderWidth: 0,
            },
            xAxis: {
                type: 'category',
                data: ['0-2h', '2-6h', '6-12h', '12-24h', '>24h'],
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: this.fgColorFaint,
                    },
                },
                axisLabel: {
                    color: this.fgColorLow,
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
                        color: this.fgColorLow,
                    },
                },
            },
            series: [
                {
                    type: 'bar',
                    data: this.printtimeAvgArray,
                    itemStyle: {
                        color: '#BDBDBD',
                    },
                },
            ],
        }
    }

    get printtimeAvgArray() {
        return this.$store.getters['server/history/getPrinttimeAvgArray']
    }

    get chart(): ECharts | null {
        return this.$refs.historyPrinttimeAvg?.chart ?? null
    }

    beforeDestroy() {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }

    @Watch('printtimeAvgArray')
    printtimeAvgArrayChanged(newVal: any) {
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
