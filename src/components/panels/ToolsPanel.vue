<style>
    .heater-row .vertical_align_center {
        margin: auto 0;
    }

    #line-chart {
        height: 250px;
    }

    .colHeaterIcons {
        width: 68px;
    }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-thermometer</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Temperatures</v-list-item-title>
                <v-list-item-subtitle>
                    {{ this['printer/getHeaters'].length }} heaters
                    <span v-if="this['printer/getTemperatureFans'].length === 1">, {{ this['printer/getTemperatureFans'].length }} fan</span>
                    <span v-if="this['printer/getTemperatureFans'].length > 1">, {{ this['printer/getTemperatureFans'].length }} fans</span>
                    <span v-if="this['printer/getTemperatureSensors'].length === 1">, {{ this['printer/getTemperatureSensors'].length }} sensor</span>
                    <span v-if="this['printer/getTemperatureSensors'].length > 1">, {{ this['printer/getTemperatureSensors'].length }} sensors</span>
                </v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-row align="center">
                <v-col class="py-0 font-weight-bold" style="padding-left: 68px;">Name</v-col>
                <v-col class="py-0 text-center font-weight-bold">Status</v-col>
                <v-col class="py-0 text-center font-weight-bold">Current</v-col>
                <v-col class="text-center py-0 pr-8 font-weight-bold">Target</v-col>
            </v-row>
            <div v-for="(heater, index) in this['printer/getHeaters']" v-bind:key="index" >
                <v-divider class="my-2"></v-divider>
                <v-row align="center">
                    <v-col class="flex-grow-0 py-0 pl-8 pr-0  colHeaterIcons">
                        <v-icon :color="heater.color">mdi-{{ heater.icon }}</v-icon>
                    </v-col>
                    <v-col class="py-0 font-weight-bold">{{ heater.name }}</v-col>
                    <v-col class="py-0 text-center"><small>{{ heater.target > 0 ? "active" : "off" }}</small></v-col>
                    <v-col class="py-0 text-center">{{ heater.temperature ? heater.temperature.toFixed(1) : 0 }}°C</v-col>
                    <v-col class="text-center py-0 pr-8 pr-0  vertical_align_center">
                        <toolInput :name="heater.name" :target="heater.target" :min_temp="heater.min_temp" :max_temp="heater.max_temp" command="SET_HEATER_TEMPERATURE" attribute-name="HEATER" ></toolInput>
                    </v-col>
                </v-row>
            </div>
            <div v-for="(fan, index) in this['printer/getTemperatureFans']" v-bind:key="index+99" >
                <v-divider class="my-2"></v-divider>
                <v-row align="center">
                    <v-col class="flex-grow-0 py-0 pl-8 pr-0  colHeaterIcons">
                        <v-icon :color="(fan.target ? 'grey lighten-5' : 'grey darken-2')" :class="(fan.speed ? ' icon-rotate' : '')">mdi-fan</v-icon>
                    </v-col>
                    <v-col class="py-0 font-weight-bold">{{ fan.name }}</v-col>
                    <v-col class="py-0 text-center"><small>{{ fan.target > 0 && fan.speed > 0 ? (fan.speed * 100).toFixed(0)+"%" : (fan.target > 0 ? "standby" : "off") }}</small></v-col>
                    <v-col class="py-0 text-center">{{ fan.temperature ? fan.temperature.toFixed(1) : 0}}°C</v-col>
                    <v-col class="text-center py-0 pr-8 pr-0  vertical_align_center">
                        <toolInput :name="fan.name" :target="fan.target" command="SET_TEMPERATURE_FAN_TARGET" attribute-name="temperature_fan" ></toolInput>
                    </v-col>
                </v-row>
            </div>
            <div v-for="(sensor,index) in this['printer/getTemperatureSensors']" v-bind:key="index+999">
                <v-divider class="my-2"></v-divider>
                <v-row align="center">
                    <v-col class="flex-grow-0 py-0 pl-8 pr-0 colHeaterIcons"><v-icon color="grey darken-2">mdi-thermometer</v-icon></v-col>
                    <v-col class="py-0 font-weight-bold">{{ sensor.name }}</v-col>
                    <v-col class="py-0"><span>&nbsp;</span></v-col>
                    <v-col class="py-0 text-center">
                        <span style="cursor: default;" :title="'min: '+(sensor.measured_min_temp ? sensor.measured_min_temp.toFixed(1) : 0)+'° / max: '+(sensor.measured_max_temp ? sensor.measured_max_temp.toFixed(1) : 0)+'°'">{{ sensor.temperature ? sensor.temperature.toFixed(1) : 0 }}°C</span>
                    </v-col>
                    <v-col class="text-center py-0 pr-8 vertical_align_center"><span>&nbsp;</span></v-col>
                </v-row>
            </div>
            <v-divider class="my-2" v-if="boolTempchart"></v-divider>
            <v-row v-if="boolTempchart">
                <v-col class="px-8">
                    <line-chart :chart-data="chartdata" v-if="loaded"></line-chart>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapGetters, mapState } from 'vuex'
    import toolInput from '../../inputs/ToolInput'
    import LineChart from '../../charts/LineChart.js'

    export default {
        components: {
            toolInput,
            LineChart
        },
        data: function() {
            return {
                extruderTemps: [250,215,195,0],
                loaded: false,
                chartdata: {
                    datasets: []
                }
            }
        },
        computed: {
            ...mapState({
                datasets: state => state.printer.tempHistory.datasets,
                boolTempchart: state => state.gui.dashboard.boolTempchart,
            }),
            ...mapGetters([
                'printer/getHeaters',
                'printer/getTemperatureFans',
                'printer/getTemperatureSensors',
            ]),
            datasets: {
                get () {
                    return this.$store.state.printer.tempHistory.datasets
                }
            }
        },
        created() {

        },
        methods: {

        },
        mounted () {
            this.chartdata = {
                datasets: this.datasets
            }

            setTimeout(() => {
                this.loaded = true
            }, 1000)
        },
    }
</script>

<style scoped>
    .equal-width {
        flex-basis: 0;
    }

    .category-header {
        flex: 0 0 100px;
    }
    a:not(:hover) {
        color: inherit;
    }

    .content span,
    .content strong {
        padding-left: 8px;
        padding-right: 8px;
        white-space: pre-wrap;
    }
</style>