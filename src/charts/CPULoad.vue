
<template>
    <div>
        <line-chart :chart-data="chartdata" :styles="minimizeChart"></line-chart>
    </div>
</template>

<script>
    import {bus} from "@/main";
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
                datasets: state => state.ressourcemonitor.cpuLoadHistory.datasets,
            }),
            minimizeChart() {
                return {height: '130px'}
            },
            datasets: {
                get () {
                    return this.$store.state.ressourcemonitor.cpuLoadHistory.datasets
                }
            },
        },
        methods: {
        },
        mounted:function(){
            bus.$on('resetChart', () => {
                this.$forceUpdate ();

            });
            this.chartdata = {
                datasets: this.datasets
            }
        },
        beforeDestroy() {
        }
    }
</script>