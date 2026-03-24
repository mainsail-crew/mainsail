import { Module } from 'vuex'
import { GuiRemindersState } from '@/store/gui/reminders/types'
import { actions } from '@/store/gui/reminders/actions'
import { mutations } from '@/store/gui/reminders/mutations'
import { getters } from '@/store/gui/reminders/getters'
import { RootState } from '../../types'

export const getDefaultState = (): GuiRemindersState => {
    return {
        reminders: {},
    }
}

// initial state
const state = getDefaultState()

export const reminders: Module<GuiRemindersState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
