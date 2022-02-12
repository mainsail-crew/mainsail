<template>
    <ECharts
        ref="tempchart"
        :option="chartOptions"
        :init-options="{ renderer: 'svg' }"
        style="height: 250px; width: 100%;"
        v-observe-visibility="visibilityChanged"
    ></ECharts>
</template>

<script lang="ts">

import { convertName } from '@/plugins/helpers'
import Component from 'vue-class-component'
import {Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import {PrinterTempHistoryStateSerie, PrinterTempHistoryStateSourceEntry} from '@/store/printer/tempHistory/types'

import { createComponent } from 'echarts-for-vue'
import * as echarts from 'echarts'
import {ECharts} from 'echarts/core'

interface echartsTooltipObj {
    [key: string]: any
}

@Component({
    components: {
        ECharts: createComponent({ echarts }),
    }
})
export default class TempChart extends Mixins(BaseMixin) {
    convertName = convertName

    $refs!: {
        tempchart: any
    }

    private isVisible = true
    public chartOptions = {
        darkMode: true,
        animation: false,
        tooltip: {
            animation: false,
            trigger: 'axis',
            backgroundColor: 'rgba(0,0,0,0.9)',
            borderWidth: 0,
            textStyle: {
                color: '#fff',
                fontSize: '14px'
            },
            padding: 15,
            formatter: this.tooltipFormater,
            confine: true,
            className: 'echarts-tooltip',
            position: function (pos: any, params: any, dom: any, rect: any, size: any) {
                // tooltip will be fixed on the right if mouse hovering on the left,
                // and on the left if hovering on the right.
                const obj: echartsTooltipObj = {top: 60}
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5
                return obj
            }
        },
        grid: {
            top: 35,
            right: 15,
            bottom: 30,
            left: 25,
        },
        legend: {
            animation: false,
            show: false,
            selected: {}
        },
        /*dataZoom: [{
            type: 'inside',
        }],*/
        xAxis: {
            type: 'time',
            splitNumber: 5,
            minInterval: 60*1000,
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
        yAxis: [
            {
                name: this.$t('Panels.ToolsPanel.TemperaturesInChart'),
                type: 'value',
                min: 0,
                max: (value: any) => {
                    if (!this.autoscale) return this.maxTemp

                    return Math.ceil((value.max + 5) / 20) * 20
                },
                minInterval: 20,
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
                    rotate: 90,
                    //showMaxLabel: false,
                    showMinLabel: true,
                    margin: 5,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.12)',
                    },
                },
            }, {
                show: this.boolDisplayPwmAxis,
                name: 'PWM [%]',
                min: 0,
                max: 1,
                minInterval: 0.25,
                type: 'value',
                nameLocation: 'end',
                nameGap: 5,
                nameTextStyle: {
                    color: 'rgba(255, 255, 255, 0.24)',
                    align: 'right',
                },
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    color: 'rgba(255, 255, 255, 0.24)',
                    formatter: (value: number) => { return value * 100 },
                    showMinLabel: true,
                    rotate: 90,
                    margin: 5,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.12)',
                    },
                }
            }
        ],
        media: [{
            query: {
                minWidth: 500,
            },
            option: {
                grid: {
                    right: 15,
                    left: 40,
                },
                yAxis: [
                    {
                        maxInterval: 50,
                        axisLabel: {
                            showMinLabel: false,
                            showMaxLabel: true,
                            rotate: 0
                        }
                    },
                    {
                        maxInterval: 25,
                        axisLabel: {
                            showMinLabel: false,
                            rotate: 0
                        }
                    },
                ],
            }
        }],
        dataset: {
            source: []
        },
        series: []
    }

    get chart (): ECharts | null {
        const tempchart = this.$refs.tempchart
        return tempchart?.inst ?? null
    }

    get maxHistory() {
        return this.$store.getters['server/getConfig']('server', 'temperature_store_size') ?? 1200
    }

    get series() {
        return this.$store.state.printer.tempHistory.series ?? {}
    }

    get source() {
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

    mounted() {
        this.initChart()
    }

    beforeDestroy() {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }

    initChart() {
        this.chartOptions.series = this.series
        this.chartOptions.legend.selected = this.selectedLegends
        this.updateChartPwmAxis()
    }

    updateChart() {
        if (this.chart && this.isVisible) {
            //const t0 = performance.now()
            const limitDate = new Date(Date.now() - this.maxHistory * 1000)
            let newSource = [...this.source].filter((entry: PrinterTempHistoryStateSourceEntry) => {
                return entry.date >= limitDate
            })

            this.chart?.setOption({
                dataset: {
                    source: newSource
                },
            })

            //const t1 = performance.now()
            //window.console.debug('calc chart', (t1-t0).toFixed(), newSource.length, this.source.length)

            // reset tempHistory if working sources are smaller than 80%
            if (this.source.length > 0 && newSource.length < this.maxHistory * 0.8) {
                this.$socket.emit('server.temperature_store', {}, { action: 'printer/tempHistory/init' })
            }
        }
    }

    updateChartPwmAxis() {
        if (this.boolDisplayPwmAxis) {
            this.chartOptions.yAxis[1].show = true
            this.chartOptions.grid.right = 25
            this.chartOptions.media[0].option.grid.right = 35
        } else {
            this.chartOptions.yAxis[1].show = false
            this.chartOptions.grid.right = 15
            this.chartOptions.media[0].option.grid.right = 15
        }
    }

    visibilityChanged (isVisible: boolean) {
        this.isVisible = isVisible

        if (isVisible) {
            this.initChart()
        }
    }

    tooltipFormater(datasets: any) {
        let output = ''

        const mainDatasets = datasets.filter((dataset: any) => {
            if (dataset.seriesName === 'date') return false
            if (dataset.seriesName.includes('-')) {
                if (dataset.seriesName.lastIndexOf('-') > -1) {
                    const suffix = dataset.seriesName.slice(dataset.seriesName.lastIndexOf('-') + 1)
                    return !['target', 'power'].includes(suffix)
                }

                return true
            }

            return true
        })
        if (datasets.length) {
            let outputTime = datasets[0]['axisValueLabel']
            outputTime = outputTime.substr(outputTime.indexOf(' '))

            output +=
                '<div class="row">' +
                '<div class="col py-1" style=\'border-bottom: 1px solid rgba(255, 255, 255, 0.24);\'>' +
                '<span class=\'v-icon mdi mdi-clock theme-dark\' style=\'font-size: 14px; margin-right: 5px;\'></span>' +
                '<span class=\'font-weight-bold\'>'+outputTime+'</span>' +
                '</div>' +
                '</div>'
        }

        mainDatasets.forEach((dataset: any) => {
            output += '<div class="row">'

            output += '<div class="col-auto py-0">'
            output += dataset.marker
            output += '<span class=\'ml-2\'>'+convertName(dataset.seriesName)+':</span>'
            output += '</div>'

            output += '<div class="col text-right py-0 font-weight-bold">'

            if (dataset.seriesName in dataset.value) output += dataset.value[dataset.seriesName].toFixed(1)
            if (dataset.seriesName+'-target' in dataset.value) output += ' / '+dataset.value[dataset.seriesName+'-target'].toFixed(1)
            output += '°C'

            if (dataset.seriesName+'-power' in dataset.value) output += ' [ '+(dataset.value[dataset.seriesName+'-power']*100).toFixed(0)+'% ]'
            if (dataset.seriesName+'-speed' in dataset.value) output += ' [ '+(dataset.value[dataset.seriesName+'-speed']*100).toFixed(0)+'% ]'

            output += '</div>'
            output += '</div>'
        })

        return output
    }

    @Watch('series', { deep: true })
    seriesChanged(newVal: PrinterTempHistoryStateSerie[]) {
        if (this.chart && this.chart?.isDisposed() !== true) {
            this.chart.setOption({
                series: newVal
            })
        }
    }

    @Watch('source')
    sourceChanged() {
        if (this.chart?.isDisposed() !== true) {
            this.updateChart()
        }
    }

    @Watch('selectedLegends')
    selectedLegendsChanged(newVal: any, oldVal:any) {
        if (this.chart?.isDisposed() !== true) {
            Object.keys(newVal).forEach((key) => {
                if (newVal[key] !== oldVal[key]) {
                    const actionType = newVal[key] ? 'legendSelect' : 'legendUnSelect'
                    this.chart?.dispatchAction({ type: actionType, name: key })
                }
            })
        }
    }

    @Watch('boolDisplayPwmAxis')
    boolDisplayPwmAxisChanged() {
        this.updateChartPwmAxis()
    }
}
</script>