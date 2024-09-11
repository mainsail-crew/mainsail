<template>
    <e-chart
        ref="historyAllPrintStatus"
        v-observe-visibility="visibilityChanged"
        :option="chartOptions"
        :autoresize="true"
        :init-options="{ renderer: 'svg' }"
        style="height: 200px; width: 100%" />
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ThemeMixin from '@/components/mixins/theme'
import HistoryStatsMixin from '@/components/mixins/historyStats'
import VueECharts from 'vue-echarts'
import type { ECharts } from 'echarts/core'
import { ECBasicOption } from 'echarts/types/dist/shared.d'
import { ServerHistoryStateAllPrintStatusEntry } from '@/store/server/history/types'
import { formatPrintTime } from '@/plugins/helpers'

@Component({
    components: {},
})
export default class HistoryAllPrintStatusChart extends Mixins(BaseMixin, ThemeMixin, HistoryStatsMixin) {
    @Prop({ type: String, default: 'amount' }) valueName!: 'amount' | 'filament' | 'time'
    @Ref('historyAllPrintStatus') historyAllPrintStatus!: typeof VueECharts

    get chartOptions(): ECBasicOption {
        return {
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
                valueFormatter: (value: number) => {
                    if (this.valueName === 'filament') {
                        if (value > 1000) return Math.round(value / 1000).toString() + ' m'

                        return value.toString() + ' mm'
                    }

                    if (this.valueName === 'time') {
                        return formatPrintTime(value, false)
                    }

                    return value.toString()
                },
            },
            series: [
                {
                    type: 'pie',
                    data: this.printStatusArray,
                    avoidLabelOverlap: false,
                    radius: ['35%', '60%'],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                    label: {
                        color: this.fgColorHi,
                    },
                },
            ],
        }
    }

    get selectedJobs() {
        return this.$store.getters['server/history/getSelectedJobs']
    }

    get printStatusArray() {
        const output: ServerHistoryStateAllPrintStatusEntry[] = []
        const orgArray = this.selectedJobs.length ? this.selectedPrintStatusChartData : this.allPrintStatusChartData

        orgArray.forEach((status: ServerHistoryStateAllPrintStatusEntry) => {
            const tmp = { ...status }
            tmp.name = status.displayName

            if (this.valueName === 'filament') {
                tmp.value = status.valueFilament.toFixed(0)
                if (status.valueFilament > 1000) tmp.value = Math.round(tmp.value / 1000).toString()
            } else if (this.valueName === 'time') {
                tmp.value = status.valueTime
            }

            output.push(tmp)
        })

        window.console.log(output)

        return output
    }

    get chart(): ECharts | null {
        return this.historyAllPrintStatus?.chart ?? null
    }

    beforeDestroy() {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }

    @Watch('printStatusArray')
    printStatusArrayChanged(newVal: any) {
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
