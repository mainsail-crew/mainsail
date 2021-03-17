<style>

</style>

<template>
    <div>
        <v-row>
            <v-col>
                <v-card>
                    <v-toolbar flat dense >
                        <v-toolbar-title>
                            <span class="subheading"><v-icon left>mdi-chart-areaspline</v-icon>Statistics</span>
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-card-text class="pa-0">
                        <v-row align="center">
                            <v-col class="col-12 col-sm-6 col-md-4">
                                <v-simple-table>
                                    <tbody>
                                        <tr>
                                            <td>Total Printtime</td>
                                            <td class="text-right">{{ formatPrintTime(totalPrintTime) }}</td>
                                        </tr>
                                        <tr>
                                            <td>Longest Printtime</td>
                                            <td class="text-right">{{ formatPrintTime(longestPrintTime) }}</td>
                                        </tr>
                                        <tr>
                                            <td>Avg. Printtime</td>
                                            <td class="text-right">{{ formatPrintTime(avgPrintTime) }}</td>
                                        </tr>
                                        <tr>
                                            <td>Total Filament used</td>
                                            <td class="text-right">{{ Math.round(totalFilamentUsed / 100) / 10 }} m</td>
                                        </tr>
                                        <tr>
                                            <td>Total Jobs</td>
                                            <td class="text-right">{{ totalTotalJobsCount }}</td>
                                        </tr>
                                    </tbody>
                                </v-simple-table>
                            </v-col>
                            <v-col class="col-12 col-sm-6 col-md-4">
                                <history-all-print-status></history-all-print-status>
                            </v-col>
                            <v-col class="col-12 col-sm-12 col-md-4">
                                <history-filament-usage v-if="toggleChart === 'filament_usage'"></history-filament-usage>
                                <history-printtime-avg v-if="toggleChart === 'printtime_avg'"></history-printtime-avg>
                                <div class="text-center mt-3">
                                    <v-btn-toggle v-model="toggleChart" small>
                                        <v-btn small value="filament_usage">
                                            Filament usage
                                        </v-btn>
                                        <v-btn small value="printtime_avg">
                                            Printime AVG
                                        </v-btn>
                                    </v-btn-toggle>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row class="mt-6">
            <v-col>
                <history-list-panel></history-list-panel>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import HistoryAllPrintStatus from "@/components/charts/HistoryAllPrintStatus"
    import HistoryFilamentUsage from "@/components/charts/HistoryFilamentUsage"
    import HistoryPrinttimeAvg from "@/components/charts/HistoryPrinttimeAvg"
    import HistoryListPanel from "@/components/panels/HistoryListPanel"

    export default {
        components: {
            HistoryAllPrintStatus,
            HistoryFilamentUsage,
            HistoryPrinttimeAvg,
            HistoryListPanel
        },
        data () {
            return {

            }
        },
        computed: {
            totalPrintTime: {
                get() {
                    return this.$store.getters["server/history/getTotalPrintTime"]
                }
            },
            longestPrintTime: {
                get() {
                    return this.$store.getters["server/history/getLongestPrintTime"]
                }
            },
            avgPrintTime: {
                get() {
                    return this.$store.getters["server/history/getAvgPrintTime"]
                }
            },
            totalFilamentUsed: {
                get() {
                    return this.$store.getters["server/history/getTotalFilamentUsed"]
                }
            },
            totalTotalJobsCount: {
                get() {
                    return this.$store.getters["server/history/getTotalJobsCount"]
                }
            },
            toggleChart: {
                get() {
                    return this.$store.state.gui.history.toggleChartCol3
                },
                set: function(newVal) {
                    return this.$store.dispatch("gui/setSettings", { history: { toggleChartCol3: newVal } })
                }
            }
        },
        methods: {
            formatPrintTime(totalSeconds) {
                if (totalSeconds) {
                    let output = ""

                    let days = Math.floor(totalSeconds / (3600 * 24))
                    if (days) {
                        totalSeconds %= (3600 * 24)
                        output += days+"d"
                    }

                    let hours = Math.floor(totalSeconds / 3600)
                    totalSeconds %= 3600
                    if (hours) output += " "+hours+"h"

                    let minutes = Math.floor(totalSeconds / 60)
                    if (minutes) output += " "+minutes+"m"

                    let seconds = totalSeconds % 60
                    if (seconds) output += " "+seconds.toFixed(0)+"s"

                    return output
                }

                return '--'
            },
        },
        watch: {

        }
    }
</script>
