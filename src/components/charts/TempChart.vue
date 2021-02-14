<template>
    <div id="tempchart" style="height: 250px; width: 100%;"></div>
</template>

<script>
import { mapState } from 'vuex'
import * as echarts from 'echarts'
import { convertName } from "@/plugins/helpers";

export default {
    components: {

    },
    data: function() {
        return {
            chart : null,
            tempchartDisplayMinutes: 10,
            timerChart: '',
            timerDataset: '',
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
                    formatter: (datasets) => {
                        let output = ""

                        if (datasets.length) {
                            let outputTime = datasets[0]['axisValueLabel']
                            outputTime = outputTime.substr(outputTime.indexOf(" "))

                            output += "<div class=\"row mb-2\">" +
                                    "<div class=\"col py-1\" style='border-bottom: 1px solid rgba(255, 255, 255, 0.24);'>" +
                                        "<span class='v-icon mdi mdi-clock theme-dark' style='font-size: 14px; margin-right: 5px;'></span>" +
                                        "<span class='font-weight-bold'>"+outputTime+"</span>" +
                                    "</div>" +
                                "</div>"
                        }

                        datasets.forEach(dataset => {
                            if (
                                !dataset.seriesName.endsWith('_target') &&
                                !dataset.seriesName.endsWith('_power') &&
                                !dataset.seriesName.endsWith('_speed')
                            ) {
                                output += "<div class=\"row\">"
                                output += "<div class=\"col-auto pt-2 pb-1\">"

                                const mainDataset = this.series.find(tmpDataset => tmpDataset.name === dataset.seriesName)
                                if (mainDataset)
                                    output += "<span style=\"" +
                                        "display:inline-block;" +
                                        "margin-right:6px;" +
                                        "width:10px;" +
                                        "height:10px;" +
                                        "border:1px solid "+mainDataset.lineStyle.color+";" +
                                        "background-color:"+mainDataset.lineStyle.color+"66;" +
                                        "\"></span>"

                                output += convertName(dataset.seriesName)+":"

                                output += "</div>"
                                output += "<div class=\"col text-right pt-2 pb-1 font-weight-bold\">"

                                if (dataset.value[1]) output += dataset.value[1].toFixed(1)

                                const target = datasets.find(tmpDataset => tmpDataset.seriesName === dataset.seriesName+"_target")
                                if (target) output += " / "+target.value[1].toFixed(1)

                                output += "°C"

                                const power = datasets.find(tmpDataset => tmpDataset.seriesName === dataset.seriesName+"_power")
                                if (power) output += " [ "+power.value[1].toFixed(0)+"% ]"

                                const speed = datasets.find(tmpDataset => tmpDataset.seriesName === dataset.seriesName+"_speed")
                                if (speed) output += " [ "+speed.value[1].toFixed(0)+"% ]"

                                output += "</div>"
                                output += "</div>"
                            }
                        })

                        return output
                    }
                },
                grid: {
                    top: 10,
                    right: 40,
                    bottom: 20,
                    left: 40,
                },
                xAxis: {
                    type: 'time',
                    min: new Date() - 60*10,
                    max: new Date(),
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.06)',
                        },
                    },
                    axisLabel: {
                        color: 'rgba(255, 255, 255, 0.24)'
                    },
                },
                yAxis: [
                    {
                        type: 'value',
                        min: 0,
                        max: 300,
                        minInterval: 10,
                        maxInterval: 50,
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.12)',
                            },
                        },
                        axisLabel: {
                            color: 'rgba(255, 255, 255, 0.24)',
                            formatter: '{value}°'
                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.12)',
                            },
                        }
                    },
                    {
                        min: 0,
                        max: 100,
                        minInterval: 25,
                        type: 'value',
                        splitLine: {
                            show: false,
                        },
                        axisLabel: {
                            color: 'rgba(255, 255, 255, 0.24)',
                            formatter: '{value}%'
                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.12)',
                            },
                        }
                    },
                ],
                series: []
            },
        }
    },
    computed: {
        ...mapState({
            intervalChartUpdate: state => state.gui.tempchart.intervalChartUpdate,
            intervalDatasetUpdate: state => state.gui.tempchart.intervalDatasetUpdate,
        }),
        series: {
            get () {
                return this.$store.state.printer.tempHistory.series
            }
        },
        datasets: {
            get () {
                return this.$store.state.printer.tempHistory.datasets
            }
        },
        autoscale: {
            get() {
                return this.$store.state.gui.tempchart.autoscale
            }
        },
        maxTemp: {
            get() {
                return this.$store.getters["printer/getMaxTemp"]
            }
        }
    },
    methods: {
        createChart() {
            if (document.getElementById("tempchart") && this.chart === null) {
                this.chart = echarts.init(document.getElementById("tempchart"), null, {renderer: 'svg'})
                this.chart.setOption(this.chartOptions)
            } else setTimeout(() => {
                this.createChart()
            }, 500)
        }

    },
    created() {
        this.timerChart = setInterval(() => {
            if (this.chart) {
                this.chart.setOption({
                    series: this.series,
                    xAxis: {
                        min: new Date() - 60* this.tempchartDisplayMinutes * 1000,
                        max: new Date()
                    },
                    yAxis: [{
                        max: this.autoscale ? null : this.maxTemp,
                        scale: this.autoscale
                    }]
                })
            }
        }, this.intervalChartUpdate)

        this.timerDataset = setInterval(() => {
            this.$store.dispatch("printer/tempHistory/updateDatasets")
        }, this.intervalDatasetUpdate)

        window.addEventListener('resize', () => {
            if (this.chart) this.chart.resize()
        })
    },
    mounted: function() {
        this.createChart()
    }
}
</script>