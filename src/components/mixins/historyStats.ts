import Vue from 'vue'
import Component from 'vue-class-component'
import { ServerHistoryStateAllPrintStatusEntry, ServerHistoryStateJob } from '@/store/server/history/types'
import i18n from '@/plugins/i18n'

@Component
export default class HistoryStatsMixin extends Vue {
    get allPrintStatusArray() {
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

    get allPrintStatusChartData() {
        const output: ServerHistoryStateAllPrintStatusEntry[] = [...this.allPrintStatusArray]
        const totalCount = this.$store.state.server.history.jobs.length ?? 0

        const otherLimit = totalCount * 0.05
        const others = output.filter((entry) => entry.value < otherLimit)
        if (others.length === 0) return output

        const otherValues = { amount: 0, filament: 0, time: 0 }
        others.forEach((otherGroup) => {
            const index = output.findIndex((entry) => entry.name === otherGroup.name)
            if (index !== -1) {
                otherValues.amount += output[index].value
                otherValues.filament += output[index].valueFilament
                otherValues.time += output[index].valueTime
                output.splice(index, 1)
            }
        })

        output.push({
            name: 'others',
            displayName: i18n.t(`History.StatusValues.Others`).toString(),
            value: otherValues.amount,
            valueTime: otherValues.time,
            valueFilament: otherValues.filament,
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
}
