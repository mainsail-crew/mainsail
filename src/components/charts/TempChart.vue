<template>
    <div id="tempchart" style="height: 270px; width: 100%;"></div>
</template>

<script>
import CanvasJS from '@/assets/canvasjs-3.2.3/canvasjs.min'

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
                const datasets = this.$store.state.printer.tempHistory.datasets

                return datasets.sort((a,b) => {
                    if ('name' in a && 'name' in b) {
                        if (a.name.endsWith("_target") > b.name.endsWith("_target")) return -1
                        if (a.name.endsWith("_target") < b.name.endsWith("_target")) return 1
                    }

                    return 0
                })
            }
        },
        maxTemp: {
            get() {
                return this.$store.getters["printer/getMaxTemp"]
            }
        }
    },
    methods: {
        createChart() {
            if (document.getElementById("tempchart")) {
                this.chart = new CanvasJS.Chart("tempchart", this.chartOptions)
            } else setTimeout(() => {
                this.createChart()
            }, 500)
        }

    },
    created() {

        this.timer = setInterval(() => {
            if (
                document.getElementById("tempchart") &&
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
        this.createChart()
    }
}
</script>