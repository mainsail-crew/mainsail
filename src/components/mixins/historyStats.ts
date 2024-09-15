import Vue from 'vue'
import Component from 'vue-class-component'
import {
    HistoryStatsValueNames,
    ServerHistoryStateAllPrintStatusEntry,
    ServerHistoryStateJob,
} from '@/store/server/history/types'
import i18n from '@/plugins/i18n'

type StatusKeys = 'completed' | 'in_progress' | 'cancelled' | 'default'

@Component
export default class HistoryStatsMixin extends Vue {
    valueName!: HistoryStatsValueNames

    get allPrintStatusChartData() {
        return this.getChartData(this.$store.state.server.history.jobs ?? [])
    }

    get selectedPrintStatusChartData() {
        return this.getChartData(this.$store.getters['server/history/getSelectedJobs'])
    }

    private getChartData(jobs: ServerHistoryStateJob[]) {
        const output: ServerHistoryStateAllPrintStatusEntry[] = []
        const hidePrintStatus = this.$store.state.gui.view.history.hidePrintStatus ?? []

        const colorMap: Record<StatusKeys, string> = {
            completed: '#BDBDBD',
            in_progress: '#EEEEEE',
            cancelled: '#616161',
            default: '#424242',
        }

        jobs.forEach((current: ServerHistoryStateJob) => {
            const index = output.findIndex((element) => element.name === current.status)
            if (index !== -1) {
                output[index].value += 1
                output[index].valueFilament += current.filament_used
                output[index].valueTime += current.print_duration
                return
            }

            const displayName = i18n.te(`History.StatusValues.${current.status}`, 'en')
                ? i18n.t(`History.StatusValues.${current.status}`).toString()
                : current.status

            output.push({
                name: current.status,
                displayName,
                value: 1,
                valueFilament: current.filament_used,
                valueTime: current.print_duration,
                itemStyle: {
                    opacity: 0.9,
                    color: colorMap[current.status as StatusKeys] ?? colorMap.default,
                    borderColor: '#1E1E1E',
                    borderWidth: 2,
                    borderRadius: 3,
                },
                showInTable: !hidePrintStatus.includes(current.status),
            })
        })

        return output
    }

    private groupSmallEntries(
        entries: ServerHistoryStateAllPrintStatusEntry[],
        threshold: number
    ): ServerHistoryStateAllPrintStatusEntry[] {
        const totalCount = entries.reduce((acc, cur) => acc + cur.value, 0)
        const otherLimit = totalCount * threshold
        const others = entries.filter((entry) => entry.value < otherLimit)

        if (others.length < 2) return entries

        const value = others.reduce((acc, cur) => acc + cur.value, 0)
        const remaining = entries.filter((entry) => entry.value >= otherLimit)
        const displayName = i18n.t(`History.StatusValues.Others`).toString() + ` (${others.length})`

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

    get printStatusArray() {
        const countSelected = this.$store.getters['server/history/getSelectedJobs'].length
        const orgArray = countSelected ? this.selectedPrintStatusChartData : this.allPrintStatusChartData

        const output = orgArray.map((status) => ({
            ...status,
            name: status.displayName,
            value:
                this.valueName === 'filament'
                    ? status.valueFilament
                    : this.valueName === 'time'
                      ? status.valueTime
                      : status.value,
        }))

        return this.groupSmallEntries(output, 0.05)
    }
}
