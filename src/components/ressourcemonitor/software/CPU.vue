
<template>
    <div>
        <v-card height=300>
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-fire</v-icon>Temperature</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 pt-2">
                            <line-chart :chart-data="tempchartdata" :styles="minimizeChart"></line-chart>
                        </v-col> 
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        <v-card height=300 style="margin-top:25px">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-chart-donut</v-icon>Usage</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 pt-2">
                            <line-chart :chart-data="loadchartdata" :styles="minimizeChart"></line-chart>
                        </v-col> 
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
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
                dialogRAM: {
                    show: false,
                    emptySlot: false,
                    module: []
                },
                tempchartdata: {
                    datasets: []
                },
                loadchartdata: {
                    datasets: []
                },
            }
        },
        computed: {
            ...mapState ({
                tempdatasets: state => state.ressourcemonitor.cpuTempHistory.datasets,
                loaddatasets: state => state.ressourcemonitor.cpuLoadHistory.datasets,
            }),
            minimizeChart() {
                return {height: '230px'}
            },
            tempdatasets: {
                get () {
                    return this.$store.state.ressourcemonitor.cpuTempHistory.datasets
                }
            },
            loaddatasets: {
                get () {
                    return this.$store.state.ressourcemonitor.cpuLoadHistory.datasets
                }
            },
            ifsoc:function(){
                var socket=this.$store.state.ressourcemonitor.cpu.socket;
                console.log(socket)
                if(socket=="SOC"||socket==""||socket=="Unknown"){
                    return true;
                }
                return false;
            }
        },
        methods: {

        },
        mounted(){
            this.tempchartdata = {
                datasets: this.tempdatasets
            },
            this.loadchartdata = {
                datasets: this.loaddatasets
            }

        }
    }
</script>