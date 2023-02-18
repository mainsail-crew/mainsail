import { GetterTree } from 'vuex'
import { GuiRemindersState, GuiRemindersStateReminder } from '@/store/gui/reminders/types'

// eslint-disable-next-line
export const getters: GetterTree<GuiRemindersState, any> = {
    getReminders: (state) => {
        const reminders: GuiRemindersStateReminder[] = []

        Object.keys(state.reminders).forEach((id: string) => {
            reminders.push({ ...state.reminders[id], id })
        })

        return reminders
    },

    getReminder: (state, getters) => (id: string) => {
        const reminders = getters['getReminders'] ?? []

        return reminders.find((reminder: GuiRemindersStateReminder) => reminder.id === id)
    },
}
