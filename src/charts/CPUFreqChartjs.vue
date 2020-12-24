
<template>
    <div>
        <div id="tempchart" style="height: 150px; width: 100%;"></div>
        {{this.$store.state.ressourcemonitor.cpuFreqHistory.datasets}}
    </div>
</template>
<script>
    import CanvasJS from '@/assets/canvasjs-3.2.5/canvasjs.min'
    export default {
        components: {
        },
        data: function() {
            return {
                tempchartDisplayMinutes: 10,
                timer: '',
                chartOptions: {
                    theme: "dark1",
                    backgroundColor: 'transparent',
                    animationEnabled: true,
                    legend: {
                        horizontalAlign: "center",
                        verticalAlign: "top",
                    },
                    toolTip:{
                        content: "{name}: {y}",
                        yValueFormatString: "#,###.00",
                    },
                    axisX:{
                        valueFormatString: "HH:mm" ,
                        //labelAngle: -50
                        gridThickness: 1,
                        gridColor: '#ffffff30',
                        minimum: new Date() - 60*10,
                        maximum: new Date(),
                        margin: 15,
                    },
                    axisY: {
                        gridThickness: 1,
                        gridColor: '#ffffff30',
                        minimum: 0,
                        maximum: 300,
                        interval: 50,
                    },
                    data: [ ]
                },
                chart : null
            }
        },
        computed: {
            datasets: {
                get () {
                    return this.$store.state.ressourcemonitor.cpuFreqHistory.datasets
                }
            },
            maxTemp: {
                get() {
                    return 4
                }
            }
        },
        methods: {
        },
        created() {
            this.timer = setInterval(() => {
                if (
                    this.chart &&
                    this.chart._toolBar
                ) {
                    this.chartOptions.data = this.datasets
                    this.chartOptions.axisX.minimum = new Date() - 60* this.tempchartDisplayMinutes *1000
                    this.chartOptions.axisX.maximum = new Date()
                    this.chartOptions.axisY.maximum = this.maxTemp
                    this.chart.render()
                }
            }, 1000);
        },
        mounted: function() {
            this.chart = new CanvasJS.Chart("tempchart", this.chartOptions)
        }
    }
</script>