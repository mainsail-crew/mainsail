<template>
    <v-chart
        id="tempchart"
        ref="tempchart"
        :option="chartOptions"
        :initOps="{ renderer: 'canvas' }"
        :autoresize="true"
        style="height: 250px; width: 100%;"
        v-observe-visibility="visibilityChanged"
    ></v-chart>
</template>

<script>
import { convertName } from "@/plugins/helpers"

//chart
import { use } from "echarts/core"
import { SVGRenderer } from "echarts/renderers"
import { LineChart } from "echarts/charts"
import {
    TooltipComponent,
    LegendComponent
} from "echarts/components"
import VChart from "vue-echarts"

use([
    SVGRenderer,
    LineChart,
    TooltipComponent,
    LegendComponent
])

export default {
    components: {
        VChart
    },
    data: function() {
        return {
            chart : null,
            isVisible: true,
            chartOptions: {
                darkMode: true,
                animation: false,
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    borderWidth: 0,
                    textStyle: {
                        color: '#fff',
                        fontSize: '14px'
                    },
                    padding: 15,
                    formatter: this.tooltipFormater
                },
                grid: {
                    top: 35,
                    right: 15,
                    bottom: 30,
                    left: 25,
                },
                legend: {
                    show: false,
                },
                dataZoom: [{
                    type: 'inside',
                }],
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
                        max: (value) => {
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
                            formatter: (value) => { return value * 100 },
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
                    },
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
            },
        }
    },
    computed: {
        maxHistory() {
            return this.$store.getters["server/getConfig"]('server', 'temperature_store_size') || 1200
        },
        series() {
            return this.$store.state.printer.tempHistory.series
        },
        source() {
            return this.$store.state.printer.tempHistory.source
        },
        boolTempchart() {
            return this.$store.state.gui.dashboard.boolTempchart
        },
        autoscale() {
            return this.$store.state.gui.tempchart.autoscale
        },
        guiTempchart() {
            return this.$store.state.gui.tempchart
        },
        maxTemp() {
            return this.$store.getters["printer/getMaxTemp"]
        },
        boolDisplayPwmAxis() {
            return this.$store.getters["printer/tempHistory/getBoolDisplayPwmAxis"]
        },
        selectedLegends() {
            return this.$store.getters["printer/tempHistory/getSelectedLegends"]
        }
    },
    methods: {
        updateChart() {
            if (this.chart && this.boolTempchart && this.isVisible) {
                //let t0 = performance.now()

                this.chart.setOption({
                    dataset: {
                        source: this.source
                    },
                })

                //let t1 = performance.now()
                //window.console.log(parseInt(t1-t0))
            }
        },
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
        },
        visibilityChanged (isVisible) {
            this.isVisible = isVisible

            if (!isVisible && this.chart) {
                this.chart.dispose()
            }
        },
        tooltipFormater(datasets) {
            let output = ""

            const mainDatasets = datasets.filter(dataset => !dataset.seriesName.includes('-') && dataset.seriesName !== 'date')
            if (datasets.length) {
                let outputTime = datasets[0]['axisValueLabel']
                outputTime = outputTime.substr(outputTime.indexOf(" "))

                output +=
                    "<div class=\"row\">" +
                    "<div class=\"col py-1\" style='border-bottom: 1px solid rgba(255, 255, 255, 0.24);'>" +
                    "<span class='v-icon mdi mdi-clock theme-dark' style='font-size: 14px; margin-right: 5px;'></span>" +
                    "<span class='font-weight-bold'>"+outputTime+"</span>" +
                    "</div>" +
                    "</div>"
            }

            mainDatasets.forEach(dataset => {
                output += "<div class=\"row\">"

                output += "<div class=\"col-auto py-0\">"
                output += dataset.marker
                output += "<span class='ml-2'>"+convertName(dataset.seriesName)+":</span>"
                output += "</div>"

                output += "<div class=\"col text-right py-0 font-weight-bold\">"

                if (dataset.seriesName in dataset.value) output += dataset.value[dataset.seriesName].toFixed(1)
                if (dataset.seriesName+"-target" in dataset.value) output += " / "+dataset.value[dataset.seriesName+"-target"].toFixed(1)
                output += "°C"

                if (dataset.seriesName+"-power" in dataset.value) output += " [ "+(dataset.value[dataset.seriesName+"-power"]*100).toFixed(0)+"% ]"
                if (dataset.seriesName+"-speed" in dataset.value) output += " [ "+(dataset.value[dataset.seriesName+"-speed"]*100).toFixed(0)+"% ]"

                output += "</div>"
                output += "</div>"
            })

            return output
        },
    },
    mounted() {
        window.console.log("mounted")
        this.chart = this.$refs.tempchart.chart
        this.chart.setOption({ series: this.series })
        this.chart.setOption({ legend: { selected: this.selectedLegends } })
        this.updateChartPwmAxis()
    },
    beforeDestroy() {
        window.console.log("beforeDestroy")
        if (this.chart) this.chart.dispose()
    },
    watch: {
        series: {
            deep: true,
            handler() {
                if (this.chart !== null) {
                    this.chart.setOption({
                        series: this.series
                    })
                }
            }
        },
        source() {
            if (this.chart !== null) {
                this.updateChart()
            }
        },
        selectedLegends(newVal, oldVal) {
            if (this.chart !== null) {
                Object.keys(newVal).forEach((key) => {
                    if (newVal[key] !== oldVal[key]) {
                        const actionType = newVal[key] ? 'legendSelect' : 'legendUnSelect'
                        this.chart.dispatchAction({ type: actionType, name: key })
                    }
                })
            }
        },
        boolDisplayPwmAxis() {
            window.console.log("change PWM axis")
            this.updateChartPwmAxis()
        }
    }
}
</script>