<style>

</style>

<template>
    <div>
        <v-row>
            <v-col>
                <v-card>
                    <v-toolbar flat dense >
                        <v-toolbar-title>
                            <span class="subheading"><v-icon left>mdi-chart-areaspline</v-icon>{{ $t('History.Statistics') }}</span>
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-card-text class="pa-0">
                        <v-row align="center">
                            <v-col class="col-12 col-sm-6 col-md-4">
                                <v-simple-table>
                                    <tbody>
                                        <tr>
                                            <td>{{ $t('History.TotalPrinttime') }}</td>
                                            <td class="text-right">{{ formatPrintTime(totalPrintTime) }}</td>
                                        </tr>
                                        <tr>
                                            <td>{{ $t('History.LongestPrinttime') }}</td>
                                            <td class="text-right">{{ formatPrintTime(longestPrintTime) }}</td>
                                        </tr>
                                        <tr>
                                            <td>{{ $t('History.AvgPrinttime') }}</td>
                                            <td class="text-right">{{ formatPrintTime(avgPrintTime) }}</td>
                                        </tr>
                                        <tr>
                                            <td>{{ $t('History.TotalFilamentUsed') }}</td>
                                            <td class="text-right">{{ Math.round(totalFilamentUsed / 100) / 10 }} m</td>
                                        </tr>
                                        <tr>
                                            <td>{{ $t('History.TotalJobs') }}</td>
                                            <td class="text-right">{{ totalJobsCount }}</td>
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
                                    <v-btn-toggle v-model="toggleChart" small mandatory>
                                        <v-btn small value="filament_usage">
                                            {{ $t('History.FilamentUsage') }}
                                        </v-btn>
                                        <v-btn small value="printtime_avg">
                                            {{ $t('History.PrinttimeAvg') }}
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
        name: "history",
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
                    return 'total_print_time' in this.$store.state.server.history.job_totals ? this.$store.state.server.history.job_totals.total_print_time : 0
                }
            },
            longestPrintTime: {
                get() {
                    return 'longest_print' in this.$store.state.server.history.job_totals ? this.$store.state.server.history.job_totals.longest_print : 0
                }
            },
            avgPrintTime: {
                get() {
                    if (this.totalJobsCount > 0 && this.totalPrintTime > 0) return Math.round(this.totalPrintTime / this.totalJobsCount)

                    return 0
                }
            },
            totalFilamentUsed: {
                get() {
                    return 'total_filament_used' in this.$store.state.server.history.job_totals ? this.$store.state.server.history.job_totals.total_filament_used : 0
                }
            },
            totalJobsCount: {
                get() {
                    return 'total_jobs' in this.$store.state.server.history.job_totals ? this.$store.state.server.history.job_totals.total_jobs : 0
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
