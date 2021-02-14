<template>
    <div id="heightmap" style="height: 400px; width: 100%;"></div>
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
                animation: false,
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
        window.addEventListener('resize', () => {
            if (this.chart) this.chart.resize()
        })
    },
    mounted: function() {
        this.createChart()
    }
}
</script>