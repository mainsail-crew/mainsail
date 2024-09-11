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
        if (others.length > 1) {
            let otherValue = 0

            others.forEach((otherGroup) => {
                const index = output.findIndex((entry) => entry.name === otherGroup.name)
                if (index !== -1) {
                    otherValue += output[index].value
                    output.splice(index, 1)
                }
            })

            output.push({
                name: 'others',
                displayName: i18n.t(`History.StatusValues.Others`).toString(),
                value: otherValue,
                itemStyle: {
                    opacity: 0.9,
                    color: '#616161',
                    borderColor: '#1E1E1E',
                    borderWidth: 2,
                    borderRadius: 3,
                },
                showInTable: true,
            })
        }

        return output
    }

    get selectedPrintStatusChartData() {
        const output: ServerHistoryStateAllPrintStatusEntry[] = []
        const jobs = this.$store.getters['server/history/getSelectedJobs']
        const hidePrintStatus = this.$store.state.gui.view.history.hidePrintStatus ?? []

        jobs.forEach((current: ServerHistoryStateJob) => {
            const index = output.findIndex((element) => element.name === current.status)
            if (index !== -1) output[index].value += 1
            else {
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
                    itemStyle: itemStyle,
                    showInTable: !hidePrintStatus.includes(current.status),
                })
            }
        })

        return output
    }
}
