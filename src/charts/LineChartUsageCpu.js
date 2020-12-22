//import store from '../store'
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins;

//const sampleInterval = 1000;			// ms
const maxSampleTime = 600000;		// 10min (in ms)

export default {
    extends: Line,
    mixins: [reactiveProp],
    props: ['chartData'],
    data() {
        return {
            timer: '',
            options: {
                events: [],
                animation: {
                    duration: 0					// general animation time
                },
                elements: {
                    line: {
                        tension: 0,
                        borderWidth: 1,
                    },
                    point: {
                        radius: 0,
                    }
                },
                showLines: true,
                legend: {
                    pointBackgroundColor:'rgba(203, 203, 203,0)',
                    display:false
                },
                hover: {
                    mode:undefined
                },
                tooltips: {
                    enabled: false,
                },
                maintainAspectRatio: false,
                responsive: true,
                responsiveAnimationDuration: 0, // animation duration after a resize
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'minute',
                            displayFormats: {
                                second: 'HH:mm:ss',
                                minute: 'HH:mm'
                            }
                        },
                        ticks: {
                            minor: {
                                fontColor: 'rgb(203, 203, 203)',
                                fontFamily: 'Roboto,sans-serif'
                            },
                            min: new Date() - maxSampleTime,
                            max: new Date(),
                        },
                        gridLines: {
                            color: 'rgba(203,203,203,0.1)',
                        },
                    }],
                    yAxes: [
                        {
                            gridLines: {
                                color: 'rgb(203, 203, 203)',
                                zeroLineColor: 'rgb(203, 203, 203)',
                                display: true
                            },
                            ticks: {
                                minor: {
                                    fontColor: 'rgb(203, 203, 203)',
                                    fontFamily: 'Roboto,sans-serif'
                                },
                                major: {
                                    fontColor: 'rgb(203, 203, 203)',
                                    fontFamily: 'Roboto,sans-serif'
                                },
                                min: 0,
                            }
                        }
                    ]
                }
            }
        }
    },
    created () {
        this.timer = setInterval(() => {
            this.$data._chart.config.options.scales.xAxes[0].ticks.min = new Date() - maxSampleTime
            this.$data._chart.config.options.scales.xAxes[0].ticks.max = new Date()
            this.$data._chart.update()
        }, 1000)
    },
    mounted () {
        this.renderChart(this.chartData, this.options)
    },
}