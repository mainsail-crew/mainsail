<template>
    <panel
        :icon="mdiChartAreaspline"
        :title="$t('History.Statistics')"
        card-class="history-statistics-panel"
        :collapsible="true">
        <v-card-text class="pa-0">
            <v-row align="center">
                <v-col class="col-12 col-sm-6 col-md-4">
                    <v-table>
                        <tbody>
                            <tr v-for="total in totals" :key="total.title">
                                <td>{{ total.title }}</td>
                                <td class="text-right">{{ total.value }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-col>
                <v-col class="col-12 col-sm-6 col-md-4">
                    <history-all-print-status-chart v-if="togglePrintStatus === 'chart'" :value-name="toggleValue" />
                    <history-all-print-status-table v-else :value-name="toggleValue" />
                    <div class="text-center mb-3">
                        <v-btn-toggle v-model="togglePrintStatus" size="small" mandatory>
                            <v-btn size="small" value="chart">{{ $t('History.Chart') }}</v-btn>
                            <v-btn size="small" value="table">{{ $t('History.Table') }}</v-btn>
                        </v-btn-toggle>
                        <v-tooltip v-if="!allLoaded" top>
                            <template #activator="{ props }">
                                <v-btn
                                    variant="outlined"
                                    size="small"
                                    :loading="loadings.includes('historyLoadAll')"
                                    class="ml-3 minwidth-0 px-2"
                                    color="primary"
                                    v-bind="props"
                                    
                                    @click="refreshHistory">
                                    <v-icon size="small">{{ mdiDatabaseArrowDownOutline }}</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('History.LoadCompleteHistory') }}</span>
                        </v-tooltip>
                    </div>
                    <div class="text-center mb-3">
                        <v-btn-toggle v-model="toggleValue" size="small" mandatory>
                            <v-btn v-for="option in toggleValueOptions" :key="option.value" size="small" :value="option.value">
                                {{ option.text }}
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                </v-col>
                <v-col class="col-12 col-sm-12 col-md-4">
                    <history-filament-usage v-if="toggleChart === 'filament_usage'" />
                    <history-printtime-avg v-else-if="toggleChart === 'printtime_avg'" />
                    <div class="text-center mt-3">
                        <v-btn-toggle v-model="toggleChart" size="small" mandatory>
                            <v-btn size="small" value="filament_usage">{{ $t('History.FilamentUsage') }}</v-btn>
                            <v-btn size="small" value="printtime_avg">{{ $t('History.PrinttimeAvg') }}</v-btn>
                        </v-btn-toggle>
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useSocket } from '@/composables/useSocket'
import { useHistory } from '@/composables/useHistory'
import { useHistoryStats } from '@/composables/useHistoryStats'
import Panel from '@/components/ui/Panel.vue'
import HistoryFilamentUsage from '@/components/charts/HistoryFilamentUsage.vue'
import HistoryPrinttimeAvg from '@/components/charts/HistoryPrinttimeAvg.vue'
import HistoryAllPrintStatusChart from '@/components/charts/HistoryAllPrintStatusChart.vue'
import {
    HistoryStatsValueNames,
    ServerHistoryStateJob,
    ServerHistoryStateJobAuxiliaryTotal,
} from '@/store/server/history/types'
import { mdiChartAreaspline, mdiDatabaseArrowDownOutline } from '@mdi/js'
import { formatPrintTime } from '@/plugins/helpers'
import type { TranslateResult } from 'vue-i18n'

const { loadings } = useBase()
const history = useHistory()
const { printStatusArray } = useHistoryStats('jobs')
const { t } = useI18n()
const store = useStore()

const toggleValue = ref<HistoryStatsValueNames>('jobs')

const toggleValueOptions = computed<{ text: TranslateResult; value: HistoryStatsValueNames }[]>(() => [
    { text: t('History.Jobs'), value: 'jobs' },
    { text: t('History.Filament'), value: 'filament' },
    { text: t('History.Time'), value: 'time' },
])

const existsSelectedJobs = computed(() => history.selectedJobs.value.length > 0)

const totalPrintTime = computed(() =>
    store.state.server.history.job_totals?.total_print_time ?? 0
)

const selectedPrintTime = computed(() => {
    let printtime = 0
    history.selectedJobs.value.forEach((job: ServerHistoryStateJob) => {
        printtime += job.print_duration
    })
    return printtime
})

const longestPrintTime = computed(() =>
    store.state.server.history.job_totals?.longest_print ?? 0
)

const selectedLongestPrintTime = computed(() => {
    let printtime = 0
    history.selectedJobs.value.forEach((job: ServerHistoryStateJob) => {
        if (job.print_duration > printtime) printtime = job.print_duration
    })
    return printtime
})

const avgPrintTime = computed(() => {
    if (totalJobsCount.value > 0 && totalPrintTime.value > 0)
        return Math.round(totalPrintTime.value / totalJobsCount.value)
    return 0
})

const selectedAvgPrintTime = computed(() => {
    if (history.selectedJobs.value.length > 0 && selectedPrintTime.value > 0)
        return Math.round(selectedPrintTime.value / history.selectedJobs.value.length)
    return 0
})

const totalFilamentUsed = computed(() =>
    store.state.server.history.job_totals?.total_filament_used ?? 0
)

const totalFilamentUsedFormat = computed(() => {
    const value = Math.round(totalFilamentUsed.value / 100) / 10
    return `${value} m`
})

const selectedFilamentUsed = computed(() => {
    let filamentUsed = 0
    history.selectedJobs.value.forEach((job: ServerHistoryStateJob) => {
        filamentUsed += job.filament_used
    })
    return filamentUsed
})

const selectedFilamentUsedFormat = computed(() => {
    const value = Math.round(selectedFilamentUsed.value / 100) / 10
    return `${value} m`
})

const totalJobsCount = computed(() =>
    store.state.server.history.job_totals?.total_jobs ?? 0
)

const toggleChart = computed({
    get: () => store.state.gui.view.history.toggleChartCol3,
    set: (newVal: string) => {
        store.dispatch('gui/saveSetting', { name: 'view.history.toggleChartCol3', value: newVal })
    }
})

const togglePrintStatus = computed({
    get: () => store.state.gui.view.history.toggleChartCol2,
    set: (newVal: string) => {
        store.dispatch('gui/saveSetting', { name: 'view.history.toggleChartCol2', value: newVal })
    }
})

const allLoaded = computed(() =>
    store.state.server.history.all_loaded ?? false
)

const selectedTotals = computed(() => {
    const output: { title: string; value: string }[] = [
        { title: t('History.SelectedPrinttime').toString(), value: formatPrintTime(selectedPrintTime.value, false) },
        { title: t('History.LongestPrinttime').toString(), value: formatPrintTime(selectedLongestPrintTime.value, false) },
        { title: t('History.AvgPrinttime').toString(), value: formatPrintTime(selectedAvgPrintTime.value, false) },
        { title: t('History.SelectedFilamentUsed').toString(), value: selectedFilamentUsedFormat.value },
        { title: t('History.SelectedJobs').toString(), value: history.selectedJobs.value.length.toString() },
    ]
    output.push(...auxiliarySelectedTotals.value)
    return output
})

const auxiliarySelectedTotals = computed(() => {
    const output: { title: string; value: string }[] = []
    history.moonrakerHistoryFields.value.forEach((historyField) => {
        const value = history.selectedJobs.value.reduce((acc: number, job: ServerHistoryStateJob) => {
            const historyFieldName = historyField.name.replace('history_field_', '')
            const auxiliary_data = job.auxiliary_data?.find(
                (auxiliary) => auxiliary.provider === historyField.provider && auxiliary.name === historyFieldName
            )
            if (!auxiliary_data || typeof auxiliary_data.value !== 'number') return acc
            return acc + auxiliary_data.value
        }, 0)
        output.push({
            title: historyField.desc,
            value: `${Math.round(value * 1000) / 1000} ${historyField.unit}`,
        })
    })
    return output
})

const genericTotals = computed(() => {
    const output: { title: string; value: string }[] = [
        { title: t('History.TotalPrinttime').toString(), value: formatPrintTime(totalPrintTime.value, false) },
        { title: t('History.LongestPrinttime').toString(), value: formatPrintTime(longestPrintTime.value, false) },
        { title: t('History.AvgPrinttime').toString(), value: formatPrintTime(avgPrintTime.value, false) },
        { title: t('History.TotalFilamentUsed').toString(), value: totalFilamentUsedFormat.value },
        { title: t('History.TotalJobs').toString(), value: totalJobsCount.value.toString() },
    ]
    output.push(...auxiliaryTotals.value)
    return output
})

const auxiliaryTotals = computed(() => {
    const auxiliaries = store.state.server.history.auxiliary_totals ?? []
    const output: { title: string; value: string }[] = []

    auxiliaries.forEach((auxiliary: ServerHistoryStateJobAuxiliaryTotal) => {
        const historyFieldName = `history_field_${auxiliary.field}`
        const historyField = history.moonrakerHistoryFields.value.find(
            (hf) => hf.provider === auxiliary.provider && hf.name === historyFieldName
        )
        const value = Math.round((auxiliary.total ?? 0) * 1000) / 1000

        output.push({
            title: historyField?.desc ?? auxiliary.field,
            value: `${value} ${historyField?.unit}`,
        })
    })

    return output
})

const totals = computed(() =>
    existsSelectedJobs.value ? selectedTotals.value : genericTotals.value
)

function refreshHistory() {
    store.dispatch('socket/addLoading', { name: 'historyLoadAll' })
    useSocket().emit('server.history.list', { start: 0, limit: 50 }, { action: 'server/history/getHistory' })
}
</script>
