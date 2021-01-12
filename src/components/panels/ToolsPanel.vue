<style>
    .heater-row .vertical_align_center {
        margin: auto 0;
    }

    .colHeaterIcons {
        width: 68px;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense>
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-thermometer-lines</v-icon>Temperatures</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-0 py-2 content">
            <v-container class="px-0">
                <v-row align="center">
                    <v-col class="py-2 font-weight-bold" style="padding-left: 68px;">Name</v-col>
                    <v-col class="py-2 text-center font-weight-bold d-none d-sm-block">State</v-col>
                    <v-col class="py-2 text-center font-weight-bold">Current</v-col>
                    <v-col class="py-2 pr-8 text-center font-weight-bold">Target</v-col>
                </v-row>
                <div v-for="(heater, index) in heaters" v-bind:key="index" >
                    <v-divider class="my-2"></v-divider>
                    <v-row align="center">
                        <v-col class="pl-8 pr-0 flex-grow-0 py-2colHeaterIcons">
                            <v-icon :color="heater.color">mdi-{{ heater.icon }}</v-icon>
                        </v-col>
                        <v-col class="py-2 font-weight-bold">{{ heater.name }}</v-col>
                        <v-col class="py-2 text-center d-none d-sm-block"><small>{{ heater.target > 0 ? (heater.power !== null ? (heater.power > 0 ? (heater.power * 100).toFixed(0)+'%' : "0%") : "active") : "off" }}</small></v-col>
                        <v-col class="py-2 text-center">{{ heater.temperature ? heater.temperature.toFixed(1) : 0 }}°C</v-col>
                        <v-col class="text-center py-2 pr-8 vertical_align_center">
                            <toolInput :name="heater.name" :target="heater.target" :min_temp="heater.min_temp" :max_temp="heater.max_temp" command="SET_HEATER_TEMPERATURE" attribute-name="HEATER" ></toolInput>
                        </v-col>
                    </v-row>
                </div>
                <div v-for="(fan, index) in temperatureFans" v-bind:key="index+99" >
                    <v-divider class="my-2"></v-divider>
                    <v-row align="center">
                        <v-col class="flex-grow-0 py-2 pl-8 pr-0  colHeaterIcons">
                            <v-icon :color="(fan.target ? 'grey lighten-5' : 'grey darken-2')" :class="(fan.speed ? ' icon-rotate' : '')">mdi-fan</v-icon>
                        </v-col>
                        <v-col class="py-2 font-weight-bold">{{ fan.name }}</v-col>
                        <v-col class="py-2 text-center d-none d-sm-block"><small>{{ fan.target > 0 && fan.speed > 0 ? (fan.speed * 100).toFixed(0)+"%" : (fan.target > 0 ? "standby" : "off") }}</small></v-col>
                        <v-col class="py-2 text-center">{{ fan.temperature ? fan.temperature.toFixed(1) : 0}}°C</v-col>
                        <v-col class="text-center py-2 pr-8 pr-0  vertical_align_center">
                            <toolInput :name="fan.name" :target="fan.target" command="SET_TEMPERATURE_FAN_TARGET" attribute-name="temperature_fan" ></toolInput>
                        </v-col>
                    </v-row>
                </div>
                <div v-for="(sensor,index) in temperatureSensors" v-bind:key="index+999">
                    <v-divider class="my-2"></v-divider>
                    <v-row align="center">
                        <v-col class="flex-grow-0 py-2 pl-8 pr-0 colHeaterIcons">
                            <v-icon color="grey darken-2" :title="'min: '+sensor.min_temp+'° / max: '+sensor.max_temp+'°'">{{ sensor.icon }}</v-icon>
                        </v-col>
                        <v-col class="py-2 font-weight-bold">{{ sensor.name }}</v-col>
                        <v-col class="py-2 d-none d-sm-block"><span>&nbsp;</span></v-col>
                        <v-col class="py-2 text-center">
                          <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                              <span
                                  style="cursor: default;"
                                  class=" px-0"
                                  v-bind="attrs"
                                  v-on="on"
                              >{{ sensor.temperature ? sensor.temperature.toFixed(1) : 0 }}°C</span>
                            </template>
                            <span>min: {{ sensor.measured_min_temp ? sensor.measured_min_temp.toFixed(1) : 0}}°<br />max: {{ sensor.measured_max_temp ? sensor.measured_max_temp.toFixed(1) : 0 }}°</span>
                          </v-tooltip>
                        </v-col>
                        <v-col class="text-center py-2 pr-8 vertical_align_center"><span>&nbsp;</span></v-col>
                    </v-row>
                </div>
                <v-divider class="my-2" v-if="boolTempchart"></v-divider>
                <v-row v-if="boolTempchart">
                    <v-col class="px-8 pt-6">
                        <temp-chart ></temp-chart>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'
    import toolInput from '../../inputs/ToolInput'
    import TempChart from '@/components/charts/TempChart'

    export default {
        components: {
            toolInput,
            TempChart,
        },
        data: function() {
            return {
                extruderTemps: [250,215,195,0],
            }
        },
        computed: {
            ...mapState({
                datasets: state => state.printer.tempHistory.datasets,
                boolTempchart: state => state.gui.dashboard.boolTempchart,
                printer: state => state.printer,
            }),
            heaters: {
                get () {
                    return this.$store.getters["printer/getHeaters"]
                }
            },
            temperatureFans: {
                get () {
                    return this.$store.getters["printer/getTemperatureFans"]
                }
            },
            temperatureSensors: {
                get () {
                    return this.$store.getters["printer/getTemperatureSensors"]
                }
            }
        },
        created() {

        },
        methods: {

        },
        mounted () {

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