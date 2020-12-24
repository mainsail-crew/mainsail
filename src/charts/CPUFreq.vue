
<template>
    <div>
        <div id="chart">
            <apexchart type="line" height="150" ref="chart" :options="chartOptions" :series="chartdata.datasets"></apexchart>
        </div>
        {{this.chartdata.datasets}}
    </div>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        data: function() {
            return {
                chartdata: {
                    datasets: []
                },
                chartOptions: {
                    colors: this.$store.state.ressourcemonitor.cpucolors,
                    chart: {
                        id: 'realtime',
                        height: 350,
                        type: 'line',
                        animations: {
                            enabled: true,
                            easing: 'linear',
                            stacked: false,
                            dynamicAnimation: {
                                speed: 1000,
                            }
                        },
                        toolbar: {
                            show: false
                        },
                        zoom: {
                            type: 'x',
                            enabled: true,
                            autoScaleYaxis: true
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: 'smooth'
                    },
                    title: {
                        show: false
                    },
                    markers: {
                     size: 1
                    },
                    xaxis: {
                        type: 'datetime'
                    },
                    legend: {
                        show: false
                    },
                }
            }
        },
        computed: {
            ...mapState ({
                datasets: state => state.ressourcemonitor.cpuFreqHistory.datasets,
            }),
            datasets: {
                get () {
                    return this.$store.state.ressourcemonitor.cpuFreqHistory.datasets
                }
            },
        },
        methods: {
            interval:function(){
                var me = this
                window.setInterval(function(){
                    console.log(me.chartOptions.xaxis.range)
                },1000)
            }
        },
        mounted:function(){
            this.chartdata = {
                datasets: this.datasets
            },
            this.interval()
        }
    }
</script>