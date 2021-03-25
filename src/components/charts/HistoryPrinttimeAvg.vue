<template>
    <div id="historyPrinttimeAvg" style="height: 175px; width: 100%;" v-observe-visibility="visibilityChanged"></div>
</template>

<script>
import { mapState } from 'vuex'
import * as echarts from 'echarts'

export default {
    components: {

    },
    data: function() {
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
                    trigger: 'item',
                    borderWidth: 0,
                },
                xAxis: {
                    type: 'category',
                    data: ['0-2h', '2-6h', '6-12h', '12-24h', '>24h'],
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
                    name: 'Prints',
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
                series: [{
                    type: 'bar',
                    data: [],
                    itemStyle: {
                        color: '#BDBDBD'
                    }
                }]
            },
        }
    },
    computed: {
        ...mapState({

        }),
        printtimeAvgArray: {
            get: function() {
                return this.$store.getters["server/history/getPrinttimeAvgArray"]
            }
        },
    },
    methods: {
        visibilityChanged (isVisible) {
            if(isVisible && this.chart !== null) this.chart.resize()
        },
        createChart() {
            if (document.getElementById("historyPrinttimeAvg") && this.chart === null) {
                this.chart = echarts.init(document.getElementById("historyPrinttimeAvg"), null, { renderer: 'canvas' })
                this.chart.setOption(this.chartOptions)
                this.updateChart()
            } else setTimeout(() => {
                this.createChart()
            }, 500)
        },
        updateChart() {
            if (this.chart) {
                const chartOptions = { series: this.chartOptions.series }
                chartOptions.series[0].data = this.printtimeAvgArray
                //chartOptions.series[0].itemStyle.color = this.getPrimaryColor()
                this.chart.setOption(chartOptions)
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