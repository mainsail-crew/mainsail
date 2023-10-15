<template>
    <e-chart
        ref="historyAllPrintStatus"
        v-observe-visibility="visibilityChanged"
        :option="chartOptions"
        :autoresize="true"
        :init-options="{ renderer: 'svg' }"
        style="height: 200px; width: 100%"></e-chart>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ThemeMixin from '@/components/mixins/theme'
import type { ECharts } from 'echarts/core'
import { ECBasicOption } from 'echarts/types/dist/shared.d'
import { ServerHistoryStateAllPrintStatusEntry } from '@/store/server/history/types'

@Component({
    components: {},
})
export default class HistoryAllPrintStatusChart extends Mixins(BaseMixin, ThemeMixin) {
    declare $refs: {
        historyAllPrintStatus: any
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
        return this.$store.state.gui.view.history.selectedJobs ?? []
    }

    get allPrintStatusArray() {
        return this.$store.getters['server/history/getAllPrintStatusArray']
    }

    get selectedPrintStatusArray() {
        return this.$store.getters['server/history/getSelectedPrintStatusArray']
    }

    get printStatusArray() {
        const output: ServerHistoryStateAllPrintStatusEntry[] = []
        const orgArray = this.selectedJobs.length ? this.selectedPrintStatusArray : this.allPrintStatusArray

        orgArray.forEach((status: ServerHistoryStateAllPrintStatusEntry) => {
            const tmp = { ...status }
            tmp.name = status.displayName
            output.push(tmp)
        })

        return output
    }

    get chart(): ECharts | null {
        return this.$refs.historyAllPrintStatus?.chart ?? null
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
