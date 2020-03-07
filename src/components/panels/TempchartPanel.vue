<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>fa-thermometer-three-quarters</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Temperature Chart</v-list-item-title>
                <v-list-item-subtitle>{{ heatersCount }} heaters</v-list-item-subtitle>
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
    import {mapGetters, mapState} from 'vuex'

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
                'heatersCount'
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