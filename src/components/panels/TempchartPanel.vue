<style>
    #line-chart {
        height: 250px;
    }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-thermometer</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Temperature Chart</v-list-item-title>
                <v-list-item-subtitle>
                    <span>{{ heatersCount }} heaters</span>
                    <span v-if="temperature_fans.length === 1">, {{ temperature_fans.length }} fan</span>
                    <span v-if="temperature_fans.length > 1">, {{ temperature_fans.length }} fans</span>
                </v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="pt-0 pb-2 content">
            <line-chart :chart-data="chartdata" v-if="loaded"></line-chart>
        </v-card-text>
    </v-card>
</template>

<script>
    import LineChart from '../../charts/LineChart.js'
    import { mapGetters, mapState } from 'vuex'

    export default {
        components: {
            LineChart
        },
        data () {
            return {
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
            }),
            ...mapGetters([
                'heatersCount',
                'temperature_fans'
            ])
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