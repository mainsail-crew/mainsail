<template>
    <panel
        :icon="mdiChartAreaspline"
        :title="$t('History.Statistics')"
        card-class="history-statistics-panel"
        :collapsible="true">
        <v-card-text class="pa-0">
            <v-row align="center">
                <v-col class="col-12 col-sm-6 col-md-4">
                    <v-simple-table>
                        <tbody>
                            <template v-if="existsSelectedJobs">
                                <tr>
                                    <td>{{ $t('History.SelectedPrinttime') }}</td>
                                    <td class="text-right">{{ formatPrintTime(selectedPrintTime) }}</td>
                                </tr>
                                <tr>
                                    <td>{{ $t('History.LongestPrinttime') }}</td>
                                    <td class="text-right">{{ formatPrintTime(selectedLongestPrintTime) }}</td>
                                </tr>
                                <tr>
                                    <td>{{ $t('History.AvgPrinttime') }}</td>
                                    <td class="text-right">{{ formatPrintTime(selectedAvgPrintTime) }}</td>
                                </tr>
                                <tr>
                                    <td>{{ $t('History.SelectedFilamentUsed') }}</td>
                                    <td class="text-right">{{ Math.round(selectedFilamentUsed / 100) / 10 }} m</td>
                                </tr>
                                <tr>
                                    <td>{{ $t('History.SelectedJobs') }}</td>
                                    <td class="text-right">{{ selectedJobs.length }}</td>
                                </tr>
                            </template>
                            <template v-else>
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
                            </template>
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
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import HistoryFilamentUsage from '@/components/charts/HistoryFilamentUsage.vue'
import HistoryPrinttimeAvg from '@/components/charts/HistoryPrinttimeAvg.vue'
import HistoryAllPrintStatus from '@/components/charts/HistoryAllPrintStatus.vue'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { mdiChartAreaspline } from '@mdi/js'
@Component({
    components: { Panel, HistoryFilamentUsage, HistoryPrinttimeAvg, HistoryAllPrintStatus },
})
export default class HistoryStatisticsPanel extends Mixins(BaseMixin) {
    mdiChartAreaspline = mdiChartAreaspline

    get selectedJobs() {
        return this.$store.state.gui.view.history.selectedJobs ?? []
    }

    get existsSelectedJobs() {
        return this.selectedJobs.length > 0
    }

    get totalPrintTime() {
        return 'total_print_time' in this.$store.state.server.history.job_totals
            ? this.$store.state.server.history.job_totals.total_print_time
            : 0
    }

    get selectedPrintTime() {
        let printtime = 0

        this.selectedJobs.forEach((job: ServerHistoryStateJob) => {
            printtime += job.print_duration
        })

        return printtime
    }

    get longestPrintTime() {
        return 'longest_print' in this.$store.state.server.history.job_totals
            ? this.$store.state.server.history.job_totals.longest_print
            : 0
    }

    get selectedLongestPrintTime() {
        let printtime = 0

        this.selectedJobs.forEach((job: ServerHistoryStateJob) => {
            if (job.print_duration > printtime) printtime = job.print_duration
        })

        return printtime
    }

    get avgPrintTime() {
        if (this.totalJobsCount > 0 && this.totalPrintTime > 0)
            return Math.round(this.totalPrintTime / this.totalJobsCount)

        return 0
    }

    get selectedAvgPrintTime() {
        if (this.selectedJobs.length > 0 && this.selectedPrintTime > 0)
            return Math.round(this.selectedPrintTime / this.selectedJobs.length)

        return 0
    }

    get totalFilamentUsed() {
        return 'total_filament_used' in this.$store.state.server.history.job_totals
            ? this.$store.state.server.history.job_totals.total_filament_used
            : 0
    }

    get selectedFilamentUsed() {
        let filamentUsed = 0

        this.selectedJobs.forEach((job: ServerHistoryStateJob) => {
            filamentUsed += job.filament_used
        })

        return filamentUsed
    }

    get totalJobsCount() {
        return 'total_jobs' in this.$store.state.server.history.job_totals
            ? this.$store.state.server.history.job_totals.total_jobs
            : 0
    }

    get toggleChart() {
        return this.$store.state.gui.view.history.toggleChartCol3
    }

    set toggleChart(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.history.toggleChartCol3', value: newVal })
    }

    formatPrintTime(totalSeconds: number) {
        if (totalSeconds) {
            let output = ''

            const hours = Math.floor(totalSeconds / 3600)
            totalSeconds %= 3600
            if (hours) output += ' ' + hours + 'h'

            const minutes = Math.floor(totalSeconds / 60)
            if (minutes) output += ' ' + minutes + 'm'

            const seconds = totalSeconds % 60
            if (seconds) output += ' ' + seconds.toFixed(0) + 's'

            return output
        }

        return '--'
    }
}
</script>
