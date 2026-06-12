import { computed } from 'vue'
import { useStore } from 'vuex'
import type { HistoryListRowJob, ServerHistoryStateJob } from '@/store/server/history/types'
import { HistoryListRowMaintenance } from '@/store/gui/maintenance/types'

type HistoryListPanelRow = HistoryListRowJob | HistoryListRowMaintenance

export function useHistory() {
    const store = useStore()

    const hidePrintStatus = computed(() => store.state.gui.view.history.hidePrintStatus ?? [])

    const allJobs = computed(() => store.state.server.history.jobs ?? [])

    const jobs = computed(() =>
        allJobs.value.filter((job: ServerHistoryStateJob) => {
            return !hidePrintStatus.value.includes(job.status)
        })
    )

    const selectedJobs = computed<ServerHistoryStateJob[]>(() => {
        const entries = store.state.gui.view.history.selectedJobs ?? []
        return entries.filter(
            (entry: HistoryListPanelRow) => entry.type === 'job'
        ) as ServerHistoryStateJob[]
    })

    const moonrakerHistoryFields = computed(() => {
        const config = store.state.server.config?.config ?? {}
        const sensors = Object.keys(config).filter((key) => key.startsWith('sensor '))
        const historyFields: {
            desc: string
            unit: string
            provider: string
            name: string
            parameter: string
        }[] = []

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
    })

    return {
        hidePrintStatus,
        allJobs,
        jobs,
        selectedJobs,
        moonrakerHistoryFields,
    }
}
