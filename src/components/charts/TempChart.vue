<template>
    <e-chart
        ref="tempchart"
        v-observe-visibility="visibilityChanged"
        :option="chartOptions"
        :init-options="{ renderer: 'svg' }"
        :autoresize="true"
        :style="tempchartStyle"
        class="tempchart"
        @mouseenter.native="hoverChart = true"
        @mouseleave.native="hoverChart = false" />
</template>

<script lang="ts">
import { convertName } from '@/plugins/helpers'
import Component from 'vue-class-component'
import { Mixins, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import { PrinterTempHistoryStateSerie, PrinterTempHistoryStateSourceEntry } from '@/store/printer/tempHistory/types'

import type { ECharts } from 'echarts/core'
import type {
    CallbackDataParams,
    ECBasicOption,
    TopLevelFormatterParams,
    TooltipPositionCallback,
} from 'echarts/types/dist/shared.d'
import { mdiClock } from '@mdi/js'
import { datasetTypesInPercents } from '@/store/variables'
import ThemeMixin from '../mixins/theme'

interface TempChartTooltipPosition {
    top: number
    left?: number
    right?: number
}

interface TempChartRef {
    chart?: ECharts
}

interface TempChartTooltipData extends CallbackDataParams {
    seriesName: string
    marker: string
    axisValueLabel: string
    value: Record<string, number | null>
}

@Component
export default class TempChart extends Mixins(BaseMixin, ThemeMixin) {
    @Ref('tempchart') readonly tempchart!: TempChartRef | undefined

    hoverChart = false
    private isVisible = true

    // tooltip will be fixed on the right if mouse hovering on the left,
    // and on the left if hovering on the right.
    private readonly tooltipPosition: TooltipPositionCallback = (point, _params, _el, _rect, size) => {
        const position: TempChartTooltipPosition = { top: 60 }
        const side: 'left' | 'right' = point[0] < size.viewSize[0] / 2 ? 'left' : 'right'
        position[side] = 5

        return position
    }

    private isTempChartTooltipData(param: CallbackDataParams): param is TempChartTooltipData {
        const tooltipParam = param as CallbackDataParams & {
            seriesName?: unknown
            marker?: unknown
            axisValueLabel?: unknown
            value?: unknown
        }

        return (
            typeof tooltipParam.seriesName === 'string' &&
            typeof tooltipParam.marker === 'string' &&
            typeof tooltipParam.axisValueLabel === 'string' &&
            typeof tooltipParam.value === 'object' &&
            tooltipParam.value !== null
        )
    }

    private normalizeTooltipDatasets(params: TopLevelFormatterParams): TempChartTooltipData[] {
        const entries = Array.isArray(params) ? params : [params]

        return entries.filter(this.isTempChartTooltipData)
    }

    get chartOptions(): ECBasicOption {
        return {
            renderer: 'svg',
            animation: false,
            tooltip: this.tooltip,
            grid: {
                top: 35,
                right: this.gridRight,
                bottom: 30,
                left: 25,
            },
            legend: {
                animation: false,
                show: false,
                selected: this.selectedLegends,
            },
            xAxis: {
                type: 'time',
                splitNumber: 5,
                minInterval: 60 * 1000,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: this.fgColorFaint,
                    },
                },
                axisLabel: {
                    color: this.fgColorLow,
                    margin: 10,
                    formatter: this.timeFormat,
                },
            },
            yAxis: this.yAxis,
            media: this.media,
            dataset: {
                source: [],
            },
            series: this.series,
        }
    }

    get tooltip() {
        return {
            animation: false,
            trigger: 'axis',
            backgroundColor: this.bgColor(1),
            borderWidth: 0,
            textStyle: {
                color: this.fgColorHi,
                fontSize: '14px',
            },
            padding: 15,
            formatter: this.tooltipFormatter,
            confine: true,
            className: 'echarts-tooltip',
            position: this.tooltipPosition,
        }
    }

    get yAxis() {
        return [
            {
                name: this.$t('Panels.TemperaturePanel.TemperaturesInChart'),
                type: 'value',
                min: 0,
                max: (value: { max: number }) => {
                    if (!this.autoscale) return this.maxTemp

                    return Math.ceil((value.max + 5) / 20) * 20
                },
                minInterval: 20,
                maxInterval: 100,
                nameLocation: 'end',
                nameGap: 5,
                nameTextStyle: {
                    color: this.fgColorMid,
                    align: 'left',
                },
                splitLine: {
                    lineStyle: {
                        color: this.fgColorFaint,
                    },
                },
                axisLabel: {
                    color: this.fgColorMid,
                    formatter: '{value}',
                    rotate: 90,
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
            {
                show: this.boolDisplayPwmAxis,
                name: 'PWM [%]',
                min: 0,
                max: 1,
                minInterval: 0.25,
                type: 'value',
                nameLocation: 'end',
                nameGap: 5,
                nameTextStyle: {
                    color: this.fgColorMid,
                    align: 'right',
                },
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    color: this.fgColorMid,
                    formatter: (value: number) => {
                        return value * 100
                    },
                    showMinLabel: true,
                    rotate: 90,
                    margin: 5,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: this.fgColorLow,
                    },
                },
            },
        ]
    }

    get media() {
        return [
            {
                query: {
                    minWidth: 500,
                },
                option: {
                    grid: {
                        right: this.optionGridRight,
                        left: 40,
                    },
                    yAxis: [
                        {
                            maxInterval: 50,
                            axisLabel: {
                                showMinLabel: false,
                                showMaxLabel: true,
                                rotate: 0,
                            },
                        },
                        {
                            maxInterval: 25,
                            axisLabel: {
                                showMinLabel: false,
                                rotate: 0,
                            },
                        },
                    ],
                },
            },
        ]
    }

    get chart(): ECharts | null {
        return this.tempchart?.chart ?? null
    }

    get maxHistory() {
        return this.$store.getters['printer/tempHistory/getTemperatureStoreSize']
    }

    get series(): PrinterTempHistoryStateSerie[] {
        return this.$store.state.printer.tempHistory.series ?? []
    }

    get source(): PrinterTempHistoryStateSourceEntry[] {
        return this.$store.state.printer.tempHistory.source ?? []
    }

    get autoscale() {
        return this.$store.state.gui.view.tempchart.autoscale ?? true
    }

    get maxTemp() {
        return this.$store.getters['printer/getMaxTemp'] ?? 300
    }

    get boolDisplayPwmAxis() {
        return this.$store.getters['printer/tempHistory/getBoolDisplayPwmAxis']
    }

    get selectedLegends() {
        return this.$store.getters['printer/tempHistory/getSelectedLegends']
    }

    get timeFormat() {
        return this.hours12Format ? '{hh}:{mm}' : '{HH}:{mm}'
    }

    get tempchartHeight() {
        return this.$store.state.gui.uiSettings.tempchartHeight ?? 250
    }

    get tempchartStyle() {
        return {
            height: this.tempchartHeight + 'px',
        }
    }

    get gridRight() {
        return this.boolDisplayPwmAxis ? 25 : 15
    }

    get optionGridRight() {
        if (this.boolDisplayPwmAxis) return 35

        return 15
    }

    beforeDestroy() {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible
    }

    tooltipFormatter(params: TopLevelFormatterParams): string {
        let output = ''

        const datasets = this.normalizeTooltipDatasets(params)
        const mainDatasets = datasets.filter((dataset) => dataset.seriesName.endsWith('-temperature'))
        if (datasets.length) {
            let outputTime = datasets[0].axisValueLabel
            outputTime = outputTime.substring(outputTime.indexOf(' '))
            const theme = this.$vuetify.theme.dark ? 'theme-dark' : ''

            output +=
                '<div class="row">' +
                '<div class="col py-1" style=\'border-bottom: 1px solid rgba(255, 255, 255, 0.24);\'>' +
                `<span class="v-icon mdi ${theme}" style="margin-right: 5px;">` +
                '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" viewBox="0 0 24 24" class="v-icon__svg" style="font-size: 12px; width: 12px; height: 12px;">' +
                `<path d="${mdiClock}">` +
                '</path>' +
                '</svg>' +
                '</span>' +
                '<span class="font-weight-bold">' +
                outputTime +
                '</span>' +
                '</div>' +
                '</div>'
        }

        mainDatasets.forEach((dataset) => {
            const baseSeriesName = dataset.seriesName.substring(0, dataset.seriesName.lastIndexOf('-'))
            let displayName = baseSeriesName
            if (displayName.indexOf(' ') !== -1) {
                displayName = displayName.substring(displayName.indexOf(' ') + 1)
            }

            output += '<div class="row">'

            output += '<div class="col-auto py-0">'
            output += dataset.marker
            output += "<span class='ml-2'>" + convertName(displayName) + ':</span>'
            output += '</div>'

            output += '<div class="col text-right py-0 font-weight-bold">'

            const seriesNameTemperature = `${baseSeriesName}-temperature`
            const seriesNameTarget = `${baseSeriesName}-target`

            if (seriesNameTemperature in dataset.value) {
                const value = dataset.value[seriesNameTemperature]
                output += value !== null ? value.toFixed(1) : '--'
            }
            if (seriesNameTarget in dataset.value) {
                output += ' / '
                const value = dataset.value[seriesNameTarget]
                output += value !== null ? value.toFixed(1) : '--'
            }
            output += '°C'

            datasetTypesInPercents.forEach((attrKey) => {
                const seriesName = `${baseSeriesName}-${attrKey}`
                if (!(seriesName in dataset.value) || dataset.value[seriesName] === null) return

                output += ` [ ${((dataset.value[seriesName] ?? 0) * 100).toFixed(0)}% ]`
            })

            output += '</div>'
            output += '</div>'
        })

        return output
    }

    @Watch('selectedLegends')
    selectedLegendsChanged(newVal: Record<string, boolean>) {
        if (this.chart?.isDisposed() !== true) this.chart?.setOption({ legend: { selected: newVal } })
    }

    @Watch('source')
    sourceChanged(newVal: PrinterTempHistoryStateSourceEntry[]) {
        // break if the chart isn't initialized or not visible or is hovered
        if (!this.chart || !this.isVisible || this.hoverChart) return

        this.chart?.setOption({
            dataset: {
                source: newVal,
            },
        })

        const limitDate = new Date(Date.now() - this.maxHistory * 1000)
        const newSource = newVal.filter((entry: PrinterTempHistoryStateSourceEntry) => {
            return entry.date >= limitDate
        })

        // reset tempHistory if working sources are smaller than 80%
        if (newVal.length > 0 && newSource.length < this.maxHistory * 0.8) {
            this.$socket.emit(
                'server.temperature_store',
                { include_monitors: true },
                { action: 'printer/tempHistory/init' }
            )
        }
    }
}
</script>

<style scoped>
.tempchart {
    width: 100%;
}
</style>
