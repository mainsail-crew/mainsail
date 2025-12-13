import Vue from 'vue'
import Component from 'vue-class-component'
import { HistoryListRowJob, ServerHistoryStateJob } from '@/store/server/history/types'
import { HistoryListRowMaintenance } from '@/store/gui/maintenance/types'

// I don't know why I cannot import the type from the HistoryListPanel, that's why I have to define it here again
type HistoryListPanelRow = HistoryListRowJob | HistoryListRowMaintenance

@Component
export default class HistoryMixin extends Vue {
    get hidePrintStatus() {
        return this.$store.state.gui.view.history.hidePrintStatus ?? []
    }

    get allJobs() {
        return this.$store.state.server.history.jobs ?? []
    }

    get jobs() {
        return this.allJobs.filter((job: ServerHistoryStateJob) => {
            return !this.hidePrintStatus.includes(job.status)
        })
    }

    get selectedJobs(): ServerHistoryStateJob[] {
        const entries = this.$store.state.gui.view.history.selectedJobs ?? []

        return entries.filter((entry: HistoryListPanelRow) => entry.type === 'job') as ServerHistoryStateJob[]
    }

    get moonrakerHistoryFields() {
        const config = this.$store.state.server.config ?? {}
        const sensors = Object.keys(config).filter((key) => key.startsWith('sensor '))
        const historyFields: { desc: string; unit: string; provider: string; name: string; parameter: string }[] = []

        sensors.forEach((configName) => {
            const sensor = config[configName] ?? {}

            Object.keys(sensor)
                .filter((key) => key.startsWith('history_field_'))
                .forEach((key) => {
                    const historyField = sensor[key]

                    historyFields.push({
                        desc: historyField.desc,
                        unit: historyField.units,
                        provider: configName,
                        parameter: historyField.parameter,
                        name: key,
                    })
                })
        })

        return historyFields
    }
}
