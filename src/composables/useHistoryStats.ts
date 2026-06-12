import { computed } from 'vue'
import type {
    HistoryStatsValueNames,
    ServerHistoryStateAllPrintStatusEntry,
    ServerHistoryStateJob,
} from '@/store/server/history/types'
import i18n from '@/plugins/i18n'
import { useHistory } from '@/composables/useHistory'

export function useHistoryStats(valueName: HistoryStatsValueNames) {
    const history = useHistory()

    function getStatusColor(status: string) {
        const colorMap: Record<string, string> = {
            completed: '#BDBDBD',
            in_progress: '#EEEEEE',
            cancelled: '#616161',
            default: '#424242',
        }

        return colorMap[status] ?? colorMap.default
    }

    function getLocalizedStatusName(status: string) {
        return i18n.global.te(`History.StatusValues.${status}`)
            ? i18n.global.t(`History.StatusValues.${status}`).toString()
            : status
    }

    function groupSmallEntries(
        entries: ServerHistoryStateAllPrintStatusEntry[],
        threshold: number
    ): ServerHistoryStateAllPrintStatusEntry[] {
        const totalCount = entries.reduce((acc, cur) => acc + cur.value, 0)
        const otherLimit = totalCount * threshold
        const others = entries.filter((entry) => entry.value < otherLimit)

        if (others.length < 2) return entries

        const value = others.reduce((acc, cur) => acc + cur.value, 0)
        const remaining = entries.filter((entry) => entry.value >= otherLimit)
        const displayName = i18n.global.t(`History.StatusValues.Others`).toString() + ` (${others.length})`

        remaining.push({
            name: displayName,
            displayName,
            value,
            valueFilament: 0,
            valueTime: 0,
            itemStyle: {
                opacity: 0.9,
                color: '#616161',
                borderColor: '#1E1E1E',
                borderWidth: 2,
                borderRadius: 3,
            },
            showInTable: true,
        })

        return remaining
    }

    const allPrintStati = computed(() => {
        let array = history.allJobs.value.map((job: ServerHistoryStateJob) => job.status)

        array = array.filter((item: string, index: number) => array.indexOf(item) === index)

        return array
    })

    const printStatusArray = computed<ServerHistoryStateAllPrintStatusEntry[]>(() => {
        return allPrintStati.value.map((status: string) => {
            const filterdJobs = history.allJobs.value.filter(
                (job: ServerHistoryStateJob) => job.status === status
            )

            return {
                name: status,
                displayName: getLocalizedStatusName(status),
                showInTable: !history.hidePrintStatus.value.includes(status),
                value: filterdJobs.length,
                itemStyle: {
                    opacity: 0.9,
                    color: getStatusColor(status),
                    borderColor: '#1E1E1E',
                    borderWidth: 2,
                    borderRadius: 3,
                },
            }
        })
    })

    const printStatusArrayChart = computed(() => {
        if (valueName === 'filament') {
            const jobs = history.selectedJobs.value.length
                ? history.selectedJobs.value
                : history.jobs.value

            return printStatusArray.value
                .map((entry) => {
                    const value = jobs.reduce(
                        (acc: number, cur: ServerHistoryStateJob) =>
                            cur.status === entry.name ? acc + cur.filament_used : acc,
                        0
                    )

                    return {
                        ...entry,
                        value,
                    }
                })
                .filter((entry) => entry.value > 0)
        }

        if (valueName === 'time') {
            const jobs = history.selectedJobs.value.length
                ? history.selectedJobs.value
                : history.jobs.value

            return printStatusArray.value
                .map((entry) => {
                    const value = jobs.reduce(
                        (acc: number, cur: ServerHistoryStateJob) =>
                            cur.status === entry.name ? acc + cur.total_duration : acc,
                        0
                    )

                    return {
                        ...entry,
                        value,
                    }
                })
                .filter((entry) => entry.value > 0)
        }

        return printStatusArray.value
    })

    const groupedPrintStatusArray = computed(() => {
        return groupSmallEntries(printStatusArrayChart.value, 0.05)
    })

    return {
        ...history,
        allPrintStati,
        printStatusArray,
        printStatusArrayChart,
        groupedPrintStatusArray,
    }
}
