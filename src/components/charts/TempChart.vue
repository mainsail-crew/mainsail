<template>
    <e-chart
        ref="tempchart"
        v-observe-visibility="visibilityChanged"
        :option="chartOptions"
        :init-options="{ renderer: 'svg' }"
        :autoresize="true"
        :style="tempchartStyle"
        class="w-100"
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
import type { ECBasicOption, TopLevelFormatterParams, TooltipPositionCallback } from 'echarts/types/dist/shared.d'
import type { EChartRef } from '@/types/echarts'
import { mdiClock } from '@mdi/js'
import { datasetTypesInPercents } from '@/store/variables'
import ThemeMixin from '../mixins/theme'

interface TempChartTooltipPosition {
    top: number
    left?: number
    right?: number
}

@Component
export default class TempChart extends Mixins(BaseMixin, ThemeMixin) {
    @Ref('tempchart') readonly tempchart!: EChartRef | undefined

    hoverChart = false
    isVisible = true

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
            formatter: (params: TopLevelFormatterParams) => this.tooltipFormatter(params),
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

        this.chart?.dispose()
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible
    }

    // tooltip will be fixed on the right if mouse hovering on the left,
    // and on the left if hovering on the right.
    tooltipPosition: TooltipPositionCallback = (point, _params, _el, _rect, size) => {
        const position: TempChartTooltipPosition = { top: 60 }
        const side: 'left' | 'right' = point[0] < size.viewSize[0] / 2 ? 'left' : 'right'
        position[side] = 5

        return position
    }

    tooltipFormatter(params: TopLevelFormatterParams): string {
        const entries = Array.isArray(params) ? params : [params]
        if (!entries.length) return ''

        let outputTime = ''
        const axisPayload = entries[0] as { axisValue?: string | number; axisValueLabel?: string }

        if (typeof axisPayload.axisValue === 'number') outputTime = this.formatTime(axisPayload.axisValue)
        else if (typeof axisPayload.axisValue === 'string') {
            const parsedAxisDate = Date.parse(axisPayload.axisValue)
            outputTime = Number.isNaN(parsedAxisDate) ? axisPayload.axisValue : this.formatTime(parsedAxisDate)
        } else if (typeof axisPayload.axisValueLabel === 'string') outputTime = axisPayload.axisValueLabel

        let outputRows = ''

        for (const entry of entries) {
            if (
                typeof entry.seriesName !== 'string' ||
                typeof entry.marker !== 'string' ||
                typeof entry.value !== 'object' ||
                entry.value === null ||
                !entry.seriesName.endsWith('-temperature')
            )
                continue

            const value = entry.value as Record<string, number | null>
            const baseSeriesName = entry.seriesName.substring(0, entry.seriesName.lastIndexOf('-'))
            let displayName = baseSeriesName
            if (displayName.indexOf(' ') !== -1) displayName = displayName.substring(displayName.indexOf(' ') + 1)

            outputRows += '<div class="row">'
            outputRows += `<div class="col-auto py-0">${entry.marker}<span class='ml-2'>${convertName(displayName)}:</span></div>`
            outputRows += '<div class="col text-right py-0 font-weight-bold">'

            const seriesNameTemperature = `${baseSeriesName}-temperature`
            const seriesNameTarget = `${baseSeriesName}-target`

            if (seriesNameTemperature in value) {
                const temperatureValue = value[seriesNameTemperature]
                outputRows += temperatureValue !== null ? temperatureValue.toFixed(1) : '--'
            }
            if (seriesNameTarget in value) {
                outputRows += ' / '
                const targetValue = value[seriesNameTarget]
                outputRows += targetValue !== null ? targetValue.toFixed(1) : '--'
            }
            outputRows += '°C'

            datasetTypesInPercents.forEach((attrKey) => {
                const seriesName = `${baseSeriesName}-${attrKey}`
                if (!(seriesName in value) || value[seriesName] === null) return

                outputRows += ` [ ${((value[seriesName] ?? 0) * 100).toFixed(0)}% ]`
            })

            outputRows += '</div>'
            outputRows += '</div>'
        }

        if (!outputRows) return ''

        const theme = this.$vuetify.theme.dark ? 'theme-dark' : ''

        const header =
            '<div class="row">' +
            '<div class="col py-1" style=\'border-bottom: 1px solid rgba(255, 255, 255, 0.24);\'>' +
            `<span class="v-icon mdi ${theme}" style="margin-right: 5px;">` +
            '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" viewBox="0 0 24 24" class="v-icon__svg" style="font-size: 12px; width: 12px; height: 12px;">' +
            `<path d="${mdiClock}"></path>` +
            '</svg>' +
            '</span>' +
            `<span class="font-weight-bold">${outputTime}</span>` +
            '</div>' +
            '</div>'

        return header + outputRows
    }

    @Watch('selectedLegends')
    selectedLegendsChanged(newVal: Record<string, boolean>) {
        if (this.chart?.isDisposed() === true) return

        this.chart?.setOption({ legend: { selected: newVal } })
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
