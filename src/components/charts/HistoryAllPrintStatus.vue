<template>
    <ECharts
        ref="historyAllPrintStatus"
        :option="chartOptions"
        :init-options="{ renderer: 'svg' }"
        style="height: 250px; width: 100%;"
        v-observe-visibility="visibilityChanged"
    ></ECharts>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import {createComponent} from 'echarts-for-vue'
import * as echarts from 'echarts'
import {Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {ECharts} from 'echarts/core'

@Component({
    components: {
        ECharts: createComponent({ echarts }),
    }
})
export default class HistoryAllPrintStatus extends Mixins(BaseMixin) {

    $refs!: {
        historyAllPrintStatus: any
    }

    private chartOptions: any = {
        darkMode: true,
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
        },
        series: [{
            type: 'pie',
            data: [],
            avoidLabelOverlap: false,
            radius: ['35%', '60%'],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    }

    get allPrintStatusArray() {
        return this.$store.getters['server/history/getAllPrintStatusArray']
    }

    get chart (): ECharts | null {
        const historyAllPrintStatus = this.$refs.historyAllPrintStatus
        return historyAllPrintStatus?.inst ?? null
    }

    mounted() {
        this.chartOptions.series[0].data = this.allPrintStatusArray
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

    @Watch('allPrintStatusArray')
    allPrintStatusArrayChanged(newVal: any) {
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