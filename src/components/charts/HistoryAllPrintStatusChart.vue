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

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ThemeMixin from '@/components/mixins/theme'
import HistoryStatsMixin from '@/components/mixins/historyStats'
import type { ECBasicOption } from 'echarts/types/dist/shared.d'
import type { ECharts } from 'echarts/core'
import type { EChartRef } from '@/types/echarts'
import { formatPrintTime } from '@/plugins/helpers'
import { HistoryStatsValueNames, ServerHistoryStateAllPrintStatusEntry } from '@/store/server/history/types'

@Component
export default class HistoryAllPrintStatusChart extends Mixins(BaseMixin, ThemeMixin, HistoryStatsMixin) {
    @Prop({ type: String, default: 'jobs' }) valueName!: HistoryStatsValueNames
    @Ref('historyAllPrintStatus') readonly historyAllPrintStatus!: EChartRef | undefined

    getNumericTooltipValue(value: unknown): number {
        const rawValue = Array.isArray(value) ? value[0] : value
        const numericValue = Number(rawValue)

        return Number.isFinite(numericValue) ? numericValue : 0
    }

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
                valueFormatter: (value: unknown) => {
                    const numericValue = this.getNumericTooltipValue(value)

                    if (this.valueName === 'filament') {
                        if (numericValue > 1000) return Math.round(numericValue / 1000).toString() + ' m'

                        return numericValue.toString() + ' mm'
                    }

                    if (this.valueName === 'time') {
                        return formatPrintTime(numericValue, false)
                    }

                    return numericValue.toString()
                },
            },
            series: [
                {
                    type: 'pie',
                    data: this.groupedPrintStatusArray,
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
                        color: this.fgColorHi,
                    },
                },
            ],
        }
    }

    get chart(): ECharts | null {
        return this.historyAllPrintStatus?.chart ?? null
    }

    beforeDestroy() {
        if (typeof window === 'undefined') return

        this.chart?.dispose()
    }

    @Watch('groupedPrintStatusArray')
    groupedPrintStatusArrayChanged(newVal: ServerHistoryStateAllPrintStatusEntry[]) {
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
