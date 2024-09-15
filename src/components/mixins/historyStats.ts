import Vue from 'vue'
import Component from 'vue-class-component'
import {
    HistoryStatsValueNames,
    ServerHistoryStateAllPrintStatusEntry,
    ServerHistoryStateJob,
} from '@/store/server/history/types'
import i18n from '@/plugins/i18n'

@Component
export default class HistoryStatsMixin extends Vue {
    valueName!: HistoryStatsValueNames

    get allPrintStatusChartData() {
        const output: ServerHistoryStateAllPrintStatusEntry[] = []
        const hidePrintStatus = this.$store.state.gui.view.history.hidePrintStatus ?? []
        const jobs = this.$store.state.server.history.jobs ?? []

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

            const itemStyle = {
                opacity: 0.9,
                color: '#424242',
                borderColor: '#1E1E1E',
                borderWidth: 2,
                borderRadius: 3,
            }

            switch (current.status) {
                case 'completed':
                    itemStyle['color'] = '#BDBDBD'
                    break

                case 'in_progress':
                    itemStyle['color'] = '#EEEEEE'
                    break

                case 'cancelled':
                    itemStyle['color'] = '#616161'
                    break
            }

            output.push({
                name: current.status,
                displayName,
                value: 1,
                valueFilament: current.filament_used,
                valueTime: current.print_duration,
                itemStyle,
                showInTable: !hidePrintStatus.includes(current.status),
            })
        })

        return output
    }

    get selectedPrintStatusChartData() {
        const output: ServerHistoryStateAllPrintStatusEntry[] = []
        const jobs = this.$store.getters['server/history/getSelectedJobs']
        const hidePrintStatus = this.$store.state.gui.view.history.hidePrintStatus ?? []

        jobs.forEach((current: ServerHistoryStateJob) => {
            const index = output.findIndex((element) => element.name === current.status)
            if (index !== -1) {
                output[index].value += 1
                output[index].valueTime += current.print_duration
                output[index].valueFilament += current.filament_used
                return
            }

            const displayName = i18n.te(`History.StatusValues.${current.status}`, 'en').toString()
                ? i18n.t(`History.StatusValues.${current.status}`).toString()
                : current.status
            const itemStyle = {
                opacity: 0.9,
                color: '#424242',
                borderColor: '#1E1E1E',
                borderWidth: 2,
                borderRadius: 3,
            }

            switch (current.status) {
                case 'completed':
                    itemStyle['color'] = '#BDBDBD'
                    break

                case 'in_progress':
                    itemStyle['color'] = '#EEEEEE'
                    break

                case 'cancelled':
                    itemStyle['color'] = '#616161'
                    break
            }

            output.push({
                name: current.status,
                displayName,
                value: 1,
                valueTime: current.print_duration,
                valueFilament: current.filament_used,
                itemStyle: itemStyle,
                showInTable: !hidePrintStatus.includes(current.status),
            })
        })

        return output
    }

    get printStatusArray() {
        let output: ServerHistoryStateAllPrintStatusEntry[] = []
        const countSelected = this.$store.getters['server/history/getSelectedJobs'].length
        const orgArray = countSelected ? this.selectedPrintStatusChartData : this.allPrintStatusChartData

        orgArray.forEach((status: ServerHistoryStateAllPrintStatusEntry) => {
            const tmp = { ...status }
            tmp.name = status.displayName

            if (this.valueName === 'filament') {
                tmp.value = status.valueFilament
            } else if (this.valueName === 'time') {
                tmp.value = status.valueTime
            }

            output.push(tmp)
        })

        // group all entries with less than 5% of the total
        const totalCount = output.reduce((acc, cur) => acc + cur.value, 0)
        const otherLimit = totalCount * 0.05
        const others = output.filter((entry) => entry.value < otherLimit)

        // no, or only one entry found
        if (others.length < 2) return output

        const value = others.reduce((acc, cur) => acc + cur.value, 0)
        output = output.filter((entry) => entry.value >= otherLimit)
        const displayName = i18n.t(`History.StatusValues.Others`).toString() + ` (${others.length})`
        output.push({
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

        return output
    }
}
