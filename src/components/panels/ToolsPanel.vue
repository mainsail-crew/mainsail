<style>
    .heater-row .vertical_align_center {
        margin: auto 0;
    }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-thermometer</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Heaters</v-list-item-title>
                <v-list-item-subtitle>
                    {{ heatersCount }} heaters
                    <span v-if="temperature_fans.length === 1">, {{ temperature_fans.length }} fan</span>
                    <span v-if="temperature_fans.length > 1">, {{ temperature_fans.length }} fans</span>
                    <span v-if="temperature_sensors.length === 1">, {{ temperature_sensors.length }} sensor</span>
                    <span v-if="temperature_sensors.length > 1">, {{ temperature_sensors.length }} sensors</span>
                </v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-row class="pl-3 pr-3">
                <v-col class="text-center py-0"><b>Heater</b></v-col>
                <v-col class="text-center py-0"><b>Current</b></v-col>
                <v-col class="text-center py-0"><b>Target</b></v-col>
            </v-row>
            <div v-for="(heater, index) in heaters" v-bind:key="index" >
                <v-divider class="my-2"></v-divider>
                <v-row class="pl-3 pr-3 heater-row">
                    <v-col class="text-center py-0">
                        <b>{{ heater.name }}</b><br />
                        <small>{{ heater.target > 0 ? "active" : "off" }}</small>
                    </v-col>
                    <v-col class="text-center py-0 vertical_align_center"><span>{{ heater.temperature.toFixed(1) }}°C</span></v-col>
                    <v-col class="text-center py-0 vertical_align_center">
                        <toolInput :name="heater.name" :target="heater.target" command="SET_HEATER_TEMPERATURE" attribute-name="HEATER" ></toolInput>
                    </v-col>
                </v-row>
            </div>
            <div v-for="(fan, index) in temperature_fans" v-bind:key="index+99" >
                <v-divider class="my-2"></v-divider>
                <v-row class="pl-3 pr-3 heater-row">
                    <v-col class="text-center py-0">
                        <b>{{ fan.name }}</b><br />
                        <small>{{ fan.target > 0 && fan.speed > 0 ? (fan.speed * 100).toFixed(0)+"%" : (fan.target > 0 ? "standby" : "off") }}</small>
                    </v-col>
                    <v-col class="text-center py-0 vertical_align_center"><span>{{ fan.temperature.toFixed(1) }}°C</span></v-col>
                    <v-col class="text-center py-0 vertical_align_center">
                        <toolInput :name="fan.name" :target="fan.target" command="SET_TEMPERATURE_FAN_TARGET" attribute-name="temperature_fan" ></toolInput>
                    </v-col>
                </v-row>
            </div>
            <div v-if="temperature_sensors.length" >
                <v-divider class="my-2"></v-divider>
                <v-row class="pl-3 pr-3 heater-row">
                    <v-col class="text-center py-0">
                        <b>Temperature<br />Sensors</b>
                    </v-col>
                    <v-col class="text-center py-0 vertical_align_center" v-for="(sensor,index) in temperature_sensors" v-bind:key="index+999" >
                        <span>{{ sensor.temperature.toFixed(1) }}°C</span><br />
                        <small>{{ sensor.name }}</small>
                    </v-col>
                </v-row>
            </div>
            <v-divider class="my-2" v-if="boolTempchart"></v-divider>
            <v-row v-if="boolTempchart">
                <v-col>
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
                    labels: [],
                    datasets: []
                }
            }
        },
        computed: {
            ...mapState({
                labels: state => state.temperaturChart.labels,
                datasets: state => state.temperaturChart.datasets,
                boolTempchart: state => state.gui.dashboard.boolTempchart,
            }),
            ...mapGetters([
                'heaters',
                'heatersCount',
                'temperature_fans',
                'temperature_sensors',
            ])
        },
        created() {
            window.console.log(this.temperature_sensors);
        },
        methods: {
            fillData () {
                this.loaded = true;
                this.chartdata = {
                    labels: this.labels,
                    datasets: this.datasets
                }
            }
        },
        mounted () {
            this.fillData();
        },
        watch: {
            labels() {
                this.fillData();
            }
        }
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