import { Module } from 'vuex'
import { GuiRemindersState } from '@/store/gui/reminders/types'
import { actions } from '@/store/gui/reminders/actions'
import { mutations } from '@/store/gui/reminders/mutations'
import { getters } from '@/store/gui/reminders/getters'

export const getDefaultState = (): GuiRemindersState => {
    return {
        reminders: {},
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const reminders: Module<GuiRemindersState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
