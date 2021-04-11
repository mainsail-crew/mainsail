<template>
    <div id="historyFilamentUsage" style="height: 175px; width: 100%;" v-observe-visibility="visibilityChanged"></div>
</template>

<script>
import { mapState } from 'vuex'
import * as echarts from 'echarts'

export default {
    components: {

    },
    data: function() {
        let _this = this;
        return {
            chart : null,
            chartOptions: {
                darkMode: true,
                animation: false,
                grid: {
                    top: 25,
                    right: 40,
                    bottom: 30,
                    left: 40,
                },
                tooltip: {
                    trigger: 'axis',
                    borderWidth: 0,
                    formatter: (datasets) => {
                        let output = ""

                        if (datasets.length) {
                            output = datasets[0]['marker']
                            let outputTime = datasets[0]['axisValueLabel']
                            outputTime = outputTime.substr(0, outputTime.indexOf(" ")+1)
                            let outputTimeDate = new Date(outputTime)
                            outputTime = outputTimeDate.toLocaleDateString()
                            let outputValue = Math.round(datasets[0]['data'][1] * 10) / 10

                            output += outputTime+": "+outputValue+"m"
                        }

                        return output
                    }
                },
                xAxis: {
                    type: 'time',
                    min: new Date().setHours(0,0,0) - 60*60*24*14*1000,
                    max: new Date().setHours(0,0,0),
                    minInterval: 60*60*24*1000,
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
                yAxis: {
                    name: _this.$t('History.HistoryFilamentUsage'),
                    type: 'value',
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
                        //rotate: 90,
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
                },
                color: ['#BDBDBD'],
                series: [{
                    type: 'bar',
                    data: [],
                    showSymbol: false
                }],
            },
        }
    },
    computed: {
        ...mapState({

        }),
        filamentUsageArray: {
            get: function() {
                return this.$store.getters["server/history/getFilamentUsageArray"]
            }
        },
    },
    methods: {
        visibilityChanged (isVisible) {
            if(isVisible && this.chart !== null) this.chart.resize()
        },
        createChart() {
            if (document.getElementById("historyFilamentUsage") && this.chart === null) {
                this.chart = echarts.init(document.getElementById("historyFilamentUsage"), null, { renderer: 'canvas' })
                this.chart.setOption(this.chartOptions)
                this.updateChart()
            } else setTimeout(() => {
                this.createChart()
            }, 500)
        },
        updateChart() {
            if (this.chart) {
                const chartOptions = { series: this.chartOptions.series }
                chartOptions.series[0].data = this.filamentUsageArray
                //chartOptions.color = [this.getPrimaryColor()]
                this.chart.setOption(chartOptions)
                this.chart.resize()
            }
        },
        getPrimaryColor() {
            if (this.$vuetify.theme.isDark) {
                return this.$vuetify.theme.themes.dark.primary
            } else {
                return this.$vuetify.theme.themes.light.primary
            }
        }
    },
    created() {
        window.addEventListener('resize', () => {
            if (this.chart) this.chart.resize()
        })
    },
    mounted: function() {
        this.createChart()
    },
    watch: {
        filamentUsageArray: {
            deep: true,
            handler() {
                this.updateChart()
            }
        },
    }
}
</script>