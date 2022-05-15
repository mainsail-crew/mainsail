<template>
    <div class="resize-helper">
        <e-chart
            ref="historyAllPrintStatus"
            v-observe-visibility="visibilityChanged"
            :option="chartOptions"
            :init-options="{ renderer: 'svg' }"
            style="height: 250px; width: 100%"></e-chart>
        <resize-observer @notify="handleResize" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import type { ECharts } from 'echarts/core'
import { ECBasicOption } from 'echarts/types/dist/shared'
import { ServerHistoryStateAllPrintStatusEntry } from '@/store/server/history/types'
import { Debounce } from 'vue-debounce-decorator'

@Component({
    components: {},
})
export default class HistoryAllPrintStatus extends Mixins(BaseMixin) {
    declare $refs: {
        historyAllPrintStatus: any
    }

    private chartOptions: ECBasicOption = {
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
        series: [
            {
                type: 'pie',
                data: [],
                avoidLabelOverlap: false,
                radius: ['35%', '60%'],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
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
        return this.$refs.historyAllPrintStatus ?? null
    }

    mounted() {
        this.chartOptions.series[0].data = this.printStatusArray
        this.chart?.setOption(this.chartOptions)
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

    @Debounce(200)
    handleResize() {
        this.$nextTick(() => {
            this.chart?.resize()
        })
    }
}
</script>

<style scoped>
.resize-helper {
    position: relative;
}
</style>
