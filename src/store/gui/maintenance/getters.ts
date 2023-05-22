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

    /*getReminder: (state, getters) => (id: string) => {
        const reminders = getters['getReminders'] ?? []

        return reminders.find((reminder: GuiRemindersStateReminder) => reminder.id === id)
    },

    getOverdueReminders: (state, getters, rootState) => {
        const currentTotalPrintTime = rootState.server.history.job_totals.total_print_time
        const reminders: GuiRemindersStateReminder[] = getters['getReminders'] ?? []
        return reminders.filter(
            (reminder) => reminder.time_delta - (currentTotalPrintTime - reminder.start_total_print_time) < 0
        )
    },*/
}
