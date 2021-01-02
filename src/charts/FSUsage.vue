
<template>
    <div>
        <line-chart :chart-data="chartdata" :styles="minimizeChart"></line-chart>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import LineChart from '@/charts/LineChartUsageCpu.js'

    export default {
        props:['partition'],
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
                datasets: state => state.ressourcemonitor.filesystemPartitionUsageHistory.datasets,
            }),
            minimizeChart() {
                return {height: '140px'}
            },
            datasets: {
                get () {
                    var newDataset = []
                    var filter = this.partition
                    this.$store.state.ressourcemonitor.filesystemPartitionUsageHistory.datasets.forEach(function(element){
                        if(element.label.includes(filter)){
                            newDataset.push(element)
                        }
                    })
                    return newDataset
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