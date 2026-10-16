<template>
    <div>
        <div
            v-if="relativeToTarget && !hasRelativeTemperatures"
            class="px-4 pt-2 text-caption text--secondary"
            role="status">
            {{ $t('Panels.TemperaturePanel.NoRelativeTemperatures') }}
        </div>
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
    </div>
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

@Component
export default class TempChart extends Mixins(BaseMixin, ThemeMixin) {
    @Ref('tempchart') readonly tempchart!: EChartRef | undefined

    hoverChart = false
    isVisible = true
    displayedSource: PrinterTempHistoryStateSourceEntry[] = this.$store.state.printer.tempHistory.source ?? []

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
                source: this.chartSource,
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
                name: this.$t(
                    this.relativeToTarget
                        ? 'Panels.TemperaturePanel.RelativeTemperaturesInChart'
                        : 'Panels.TemperaturePanel.TemperaturesInChart'
                ),
                type: 'value',
                min: this.relativeToTarget
                    ? (value: { min: number }) =>
                          Number.isFinite(value.min) ? Math.min(99, Math.floor(value.min - 1)) : 90
                    : 0,
                max: (value: { max: number }) => {
                    if (this.relativeToTarget)
                        return Number.isFinite(value.max) ? Math.max(101, Math.ceil(value.max + 1)) : 110
                    if (!this.autoscale) return this.maxTemp

                    return Math.ceil((value.max + 5) / 20) * 20
                },
                minInterval: this.relativeToTarget ? 0 : 20,
                maxInterval: this.relativeToTarget ? Infinity : 100,
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
                            maxInterval: this.relativeToTarget ? Infinity : 50,
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
        const series = this.$store.state.printer.tempHistory.series ?? []
        if (!this.relativeToTarget) return series
        const segmentEndpoints = this.relativeSegmentEndpoints

        return series.map((serie) => {
            if (!serie.name.endsWith('-temperature') && !serie.name.endsWith('-target')) return serie

            const endpoints = segmentEndpoints[serie.name]

            return {
                ...serie,
                encode: { ...serie.encode, y: `${serie.name}-relative` },
                ...(serie.name.endsWith('-target') ? { axisPointer: { show: false } } : {}),
                ...(endpoints?.length
                    ? {
                          markPoint: {
                              symbol: 'circle',
                              symbolSize: 7,
                              label: { show: false },
                              itemStyle: {
                                  color: serie.lineStyle.color,
                              },
                              data: endpoints,
                          },
                      }
                    : {}),
            }
        })
    }

    get source(): PrinterTempHistoryStateSourceEntry[] {
        return this.$store.state.printer.tempHistory.source ?? []
    }

    get chartSource(): PrinterTempHistoryStateSourceEntry[] {
        if (!this.relativeToTarget) return this.displayedSource

        return this.displayedSource.map((entry) => {
            const normalized = { ...entry }
            Object.keys(entry)
                .filter((key) => key.endsWith('-temperature'))
                .forEach((key) => {
                    const targetKey = `${key.slice(0, -12)}-target`
                    const temperature = entry[key]
                    const target = entry[targetKey]
                    normalized[`${key}-relative`] =
                        typeof temperature === 'number' && typeof target === 'number' && target > 0
                            ? (temperature / target) * 100
                            : null
                })

            Object.keys(entry)
                .filter((key) => key.endsWith('-target'))
                .forEach((key) => {
                    const target = entry[key]
                    normalized[`${key}-relative`] = typeof target === 'number' && target > 0 ? 100 : null
                })

            return normalized
        })
    }

    get hasRelativeTemperatures(): boolean {
        const names = this.series
            .filter((serie) => serie.name.endsWith('-temperature') && this.selectedLegends[serie.name] !== false)
            .map((serie) => `${serie.name}-relative`)

        return this.chartSource.some((entry) => names.some((name) => typeof entry[name] === 'number'))
    }

    get relativeSegmentEndpoints(): Record<string, { coord: [Date, number] }[]> {
        const source = this.chartSource
        const temperatureSeries = (this.$store.state.printer.tempHistory.series ?? []).filter(
            (serie) => serie.name.endsWith('-temperature') && this.selectedLegends[serie.name] !== false
        )
        const endpoints: Record<string, { coord: [Date, number] }[]> = {}

        temperatureSeries.forEach((serie) => {
            const relativeName = `${serie.name}-relative`
            endpoints[serie.name] = source.flatMap((entry, index) => {
                const value = entry[relativeName]
                if (typeof value !== 'number') return []

                const startsAfterGap = index > 0 && typeof source[index - 1][relativeName] !== 'number'
                const endsBeforeGap = index < source.length - 1 && typeof source[index + 1][relativeName] !== 'number'
                return startsAfterGap || endsBeforeGap ? [{ coord: [entry.date, value] as [Date, number] }] : []
            })
        })

        return endpoints
    }

    get relativeToTarget(): boolean {
        return this.$store.state.gui.view.tempchart.relativeToTarget ?? false
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

    // Prefer below the cursor, then beside it, keeping a small gap.
    tooltipPosition: TooltipPositionCallback = (point, _params, _el, _rect, size) => {
        const [viewWidth, viewHeight] = size.viewSize
        const [tooltipWidth, tooltipHeight] = size.contentSize
        const margin = 8
        const gap = 20
        const clamp = (value: number, max: number) => Math.max(margin, Math.min(value, max - tooltipHeight - margin))
        const left = Math.max(margin, Math.min(point[0] + gap, viewWidth - tooltipWidth - margin))
        const below = point[1] + gap

        if (below + tooltipHeight <= viewHeight - margin) return [left, below]

        const centeredTop = clamp(point[1] - tooltipHeight / 2, viewHeight)
        if (point[0] + gap + tooltipWidth <= viewWidth - margin) return [point[0] + gap, centeredTop]
        if (point[0] - gap - tooltipWidth >= margin) return [point[0] - gap - tooltipWidth, centeredTop]

        return [left, clamp(point[1] - tooltipHeight - gap, viewHeight)]
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

            const temperature = value[seriesNameTemperature]
            const target = value[seriesNameTarget]
            if (this.relativeToTarget && typeof temperature === 'number' && typeof target === 'number' && target > 0) {
                outputRows += `${((temperature / target) * 100).toFixed(1)}% (${temperature.toFixed(1)} / ${target.toFixed(1)}°C)`
            } else {
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
            }

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

    @Watch('source')
    @Watch('hoverChart')
    @Watch('isVisible')
    sourceChanged() {
        // break if the chart isn't initialized or not visible or is hovered
        if (!this.chart || !this.isVisible || this.hoverChart) return

        const newVal = this.source
        this.displayedSource = newVal

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
