
<template>
    <div>
        <line-chart :chart-data="chartdata" :styles="minimizeChart"></line-chart>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import LineChart from '@/charts/LineChartUsageCpu.js'

    export default {
        components: {
            LineChart
        },
        data: function() {
            return {
                chartdata: {
                    datasets: []
                }
            }
        },
        computed: {
            ...mapState ({
                datasets: state => state.ressourcemonitor.gpuCoreFreqHistory.datasets,
            }),
            minimizeChart() {
                return {height: '130px'}
            },
            datasets: {
                get () {
                    return this.$store.state.ressourcemonitor.gpuCoreFreqHistory.datasets
                }
            },
        },
        methods: {
        },
        mounted:function(){
            this.chartdata = {
                datasets: this.datasets
            }
        },
        beforeDestroy() {
            
        }
    }
</script>