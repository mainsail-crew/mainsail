import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins;

//const sampleInterval = 1000;			// ms
const defaultMaxTemperature = 300;	// degC
const maxSampleTime = 600000;		// 10min (in ms)

export default {
    extends: Line,
    mixins: [reactiveProp],
    props: ['chartData'],
    data() {
        return {
            options: {
                animation: {
                    duration: 0					// general animation time
                },
                elements: {
                    line: {
                        tension: 0				// disable bezier curves
                    }
                },
                legend: {
                    labels: {
                        fontColor: 'rgb(203, 203, 203)',
                        fontFamily: 'Roboto,sans-serif',
                        filter: function(item) {
                            return !item.text.includes('_target');
                        }
                    }
                },
                tooltips: {
                    enabled: true,
                    callbacks: {
                        title: function (tooltipItem) {
                            let date = new Date(tooltipItem[0].label);
                            return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
                        },
                        label: function (tooltipItem, data) {
                            let label_target = data['datasets'][tooltipItem.datasetIndex].label+"_target";
                            let target_dataset = data['datasets'].find(dataset => dataset.label === label_target);

                            if (target_dataset !== undefined) return tooltipItem.value+" / "+target_dataset.data[tooltipItem.index];
                            return tooltipItem.value;
                        },
                    }
                },
                maintainAspectRatio: false,
                responsive: true,
                responsiveAnimationDuration: 0, // animation duration after a resize
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                color: 'rgba(0,0,0,0.2)',
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
                                min: new Date() - maxSampleTime,
                                max: new Date()
                            },
                            time: {
                                unit: 'minute',
                                displayFormats: {
                                    minute: 'HH:mm'
                                }
                            },
                            type: 'time',
                        }
                    ],
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
                                max: defaultMaxTemperature,
                                stepSize: 50
                            }
                        }
                    ]
                }
            }
        }
    },
    mounted () {
        this.renderChart(this.chartData, this.options)
    },
    methods: {
        update() {
            this.$data._chart.config.options.scales.yAxes[0].ticks.max = defaultMaxTemperature;
            this.$data._chart.config.options.scales.xAxes[0].ticks.min = new Date() - maxSampleTime;
            this.$data._chart.config.options.scales.xAxes[0].ticks.max = new Date();
            this.$data._chart.update();
        }
    },
    watch: {
        chartData () {
            this.update();
        }
    }
}