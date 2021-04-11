<template>
    <div id="historyAllPrintStatus" style="height: 250px; width: 100%;" v-observe-visibility="visibilityChanged"></div>
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
                    top: 10,
                    right: 0,
                    bottom: 0,
                    left: 10,
                },
                tooltip: {
                    trigger: 'item',
                    borderWidth: 0,
                },
                series: [{
                    type: 'pie',
                    data: [],
                    //radius: '50%',
                    avoidLabelOverlap: false,
                    radius: ['35%', '60%'],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]

            },
        }
    },
    computed: {
        ...mapState({

        }),
        getAllPrintStatusArray: {
            get: function() {
                return this.$store.getters["server/history/getAllPrintStatusArray"]
            }
        },
    },
    methods: {
        visibilityChanged (isVisible) {
            if(isVisible && this.chart !== null) this.chart.resize()
        },
        createChart() {
            if (document.getElementById("historyAllPrintStatus") && this.chart === null) {
                this.chart = echarts.init(document.getElementById("historyAllPrintStatus"), null, { renderer: 'svg' })
                this.chart.setOption(this.chartOptions)
                this.updateChart()
            } else
                setTimeout(() => {
                    this.createChart()
                }, 500)
        },
        updateChart() {
            if (this.chart) {
                const chartOptions = { series: this.chartOptions.series }
                chartOptions.series[0].data = this.getAllPrintStatusArray
                this.chart.setOption(chartOptions)
                this.chart.resize()
            }
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
    watch: {
        getAllPrintStatusArray: {
            deep: true,
            handler() {
                this.updateChart()
            }
        },
    }
}
</script>