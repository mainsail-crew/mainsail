import { GetterTree } from 'vuex'
import { GuiMaintenanceState, GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

// eslint-disable-next-line
export const getters: GetterTree<GuiMaintenanceState, any> = {
    getEntries: (state) => {
        const entries: GuiMaintenanceStateEntry[] = []

        Object.keys(state.entries).forEach((id: string) => {
            entries.push({ ...state.entries[id], id })
        })

        return entries
    },

    getOverdueEntries: (state, getters, rootState) => {
        const currentTotalPrintTime = rootState.server.history.job_totals.total_print_time ?? 0
        const currentTotalFilamentUsed = rootState.server.history.job_totals.total_filament_used ?? 0
        const currentDate = new Date().getTime() / 1000

        const entries: GuiMaintenanceStateEntry[] = getters['getEntries'] ?? []

        return entries.filter((entry) => {
            if (entry.reminder.type === null || entry.end_time !== null) return false

            if (entry.reminder.filament.bool) {
                const end = entry.start_filament + (entry.reminder.filament.value ?? 0) * 1000

                if (end <= currentTotalFilamentUsed) return true
            }

            if (entry.reminder.printtime.bool) {
                const end = entry.start_printtime + (entry.reminder.printtime.value ?? 0) * 3600

                if (end <= currentTotalPrintTime) return true
            }

            if (entry.reminder.date.bool) {
                const end = entry.start_time + (entry.reminder.date.value ?? 0) * 24 * 60 * 60

                if (end <= currentDate) return true
            }

            return false
        })
    },
}
