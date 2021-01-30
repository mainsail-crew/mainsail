<template>
    <div id="tempchart" style="height: 300px; width: 100%;"></div>
</template>

<script>
import { mapState } from 'vuex'
import CanvasJS from '@/assets/canvasjs-3.2.3/canvasjs.min'

export default {
    components: {

    },
    data: function() {
        return {
            chart : null,
            tempchartDisplayMinutes: 10,
            timerChart: '',
            timerDataset: '',
            chartOptions: {
                theme: "dark1",
                zoomEnabled: true,
                backgroundColor: 'transparent',
                animationEnabled: true,
                legend: {
                    horizontalAlign: "center",
                    verticalAlign: "top",
                },
                toolTip:{
                    shared: true,
                    borderColor: "#ffffff30",
                    content: (e) => {
                        let output = ""

                        if (e.entries[0].dataPoint.x) {
                            const date = new Date(e.entries[0].dataPoint.x)
                            const hours = "0" + date.getHours();
                            const minutes = "0" + date.getMinutes();
                            const seconds = "0" + date.getSeconds();
                            output += "<strong>"+hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)+"</strong>"
                        }

                        const mainEntries = e.entries.filter(dataset => dataset.dataSeries.showInLegend && dataset.dataSeries.visible).sort((a,b) => {
                            if (a.dataSeries.legendText > b.dataSeries.legendText) return 1
                            if (a.dataSeries.legendText < b.dataSeries.legendText) return -1

                            return 0
                        })

                        if (mainEntries.length) {
                            mainEntries.forEach(dataset => {
                                output += "<br />"
                                output += dataset.dataSeries.legendText+": "+dataset.dataPoint.y.toFixed(1)

                                const datasetTarget = e.entries.find(datasetTarget => datasetTarget.dataSeries.name === dataset.dataSeries.name+"_target")
                                if (datasetTarget) {
                                    output += " / "+datasetTarget.dataPoint.y.toFixed(1)
                                }

                                output += "°C"

                                const datasetPower = e.entries.find(datasetPower => datasetPower.dataSeries.name === dataset.dataSeries.name+"_power")
                                if (datasetPower) {
                                  output += " at "+datasetPower.dataPoint.y.toFixed(0)+"%"
                                }
                            })
                        }

                        return output
                    }
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
                    suffix: '°C'
                },
                axisY2: {
                    gridThickness: 0,
                    gridColor: '#ffffff30',
                    minimum: 0,
                    maximum: 100,
                    interval: 25,
                    suffix: '%'
                },
                data: [ ]
            },
        }
    },
    computed: {
        ...mapState({
            intervalChartUpdate: state => state.gui.tempchart.intervalChartUpdate,
            intervalDatasetUpdate: state => state.gui.tempchart.intervalDatasetUpdate,
        }),
        datasets: {
            get () {
                const datasets = this.$store.state.printer.tempHistory.datasets

                return datasets.sort((a,b) => {
                    if ('name' in a && 'name' in b) {
                        if (a.name.endsWith("_target") > b.name.endsWith("_power")) return -1
                        if (a.name.endsWith("_power") < b.name.endsWith("_target")) return 1
                        if (a.name.endsWith("_target") > b.name.endsWith("_target")) return -1
                        if (a.name.endsWith("_target") < b.name.endsWith("_target")) return 1
                    }

                    return 0
                })
            }
        },
        autoscale: {
            get() {
                return this.$store.state.gui.tempchart.autoscale
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
        this.timerChart = setInterval(() => {
            if (
                document.getElementById("tempchart") &&
                this.chart &&
                this.chart._toolBar
            ) {
                this.chartOptions.data = this.datasets
                this.chartOptions.axisX.minimum = new Date() - 60* this.tempchartDisplayMinutes *1000
                this.chartOptions.axisX.maximum = new Date()
                this.chartOptions.axisY.maximum = this.autoscale ? null : this.maxTemp
                //this.chartOptions.axisY.interval = this.autoscale ? 25 : 50
                this.chart.render()
            }
        }, this.intervalChartUpdate)

      this.timerDataset = setInterval(() => {
          this.$store.dispatch("printer/tempHistory/updateDatasets")
      }, this.intervalDatasetUpdate)
    },
    mounted: function() {
        this.createChart()
    }
}
</script>