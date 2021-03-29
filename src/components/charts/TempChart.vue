<template>
    <div id="tempchart" style="height: 250px; width: 100%;" v-observe-visibility="visibilityChanged"></div>
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
            timerChart: '',
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
                    formatter: (datasets) => {
                        let output = ""

                        if (datasets.length) {
                            let outputTime = datasets[0]['axisValueLabel']
                            outputTime = outputTime.substr(outputTime.indexOf(" "))

                            output += "<div class=\"row\">" +
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
                                output += "<div class=\"col-auto py-0\">"

                                const mainDataset = this.series.find(tmpDataset => tmpDataset.name === dataset.seriesName)
                                if (mainDataset)
                                    output += "<span style=\"" +
                                        "display:inline-block;" +
                                        "margin-right:10px;" +
                                        "width:8px;" +
                                        "height:8px;" +
                                        "border-radius: 50%;" +
                                        "background-color:"+mainDataset.lineStyle.color+"CC;" +
                                        "\"></span>"

                                output += convertName(dataset.seriesName)+":"

                                output += "</div>"
                                output += "<div class=\"col text-right py-0 font-weight-bold\">"

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
                    top: 35,
                    right: 25,
                    bottom: 30,
                    left: 25,
                },
                dataZoom: [{
                    type: 'inside',
                }],
                xAxis: {
                    type: 'time',
                    min: new Date() - 60*10,
                    max: new Date(),
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
                        name: 'Temperature [°C]',
                        type: 'value',
                        min: 0,
                        max: 300,
                        minInterval: 10,
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
                        }
                    }, {
                        name: 'PWM [%]',
                        min: 0,
                        max: 100,
                        minInterval: 100,
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
                            formatter: '{value}',
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
                series: [],
            },
        }
    },
    computed: {
        ...mapState({
            intervalChartUpdate: state => state.gui.tempchart.intervalChartUpdate,
            boolTempchart: state => state.gui.dashboard.boolTempchart,
        }),
        maxHistory: {
            get() {
                return this.$store.getters["server/getConfig"]('server', 'temperature_store_size') || 1200
            }
        },
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
        },
        currentMaxTemp: {
            get() {
                return this.$store.getters["printer/tempHistory/getCurrentMaxTemp"]
            }
        },
        boolDisplayPwmAxis: {
            get() {
                return this.$store.getters["printer/tempHistory/getBoolDisplayPwmAxis"]
            }
        }
    },
    methods: {
        createChart() {
            if (document.getElementById("tempchart") && this.chart === null) {
                this.chart = echarts.init(document.getElementById("tempchart"), null, {renderer: 'canvas'})
                this.chart.setOption(this.chartOptions)
                this.updateChart()
            } else setTimeout(() => {
                this.createChart()
            }, 1000)
        },
        updateChart() {
            if (
                this.chart &&
                this.boolTempchart &&
                this.isVisible
            ) {
                this.chart.setOption({
                    series: this.series,
                    grid: {
                        left: 25,
                        right: this.boolDisplayPwmAxis ? 25 : 15,
                    },
                    xAxis: {
                        min: new Date() - this.maxHistory * 1000,
                        max: new Date(),
                    },
                    yAxis: [{
                        axisLabel: {
                            rotate: 90,
                            showMinLabel: true,
                            margin: 5,
                        },
                        max: this.autoscale ? this.currentMaxTemp : this.maxTemp,
                    }, {
                        show: this.boolDisplayPwmAxis,
                        axisLabel: {
                            showMinLabel: true,
                            rotate: 90,
                            margin: 5,
                        }
                    }],
                    media: [{
                        query: {
                            minWidth: 500,
                        },
                        option: {
                            grid: {
                                right: this.boolDisplayPwmAxis ? 40 : 15,
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
                })

                setTimeout(() => {
                    this.updateChart()
                }, this.intervalChartUpdate)
            }
        },
        visibilityChanged (isVisible) {
            this.isVisible = isVisible
            if(isVisible && this.chart !== null) this.chart.resize()
            if(this.chart !== null) this.updateChart()
        },
    },
    created() {
        window.addEventListener('resize', () => {
            if (this.chart) this.chart.resize()
        })
    },
    mounted: function() {
        this.createChart()
    },
}
</script>