import { GuiNotificationState } from './types'
import { Module } from 'vuex'
import { actions } from './actions'
import { mutations } from './mutations'
import { getters } from './getters'
import { RootState } from '@/store/types'

export const getDefaultState = (): GuiNotificationState => {
    return {
        dismiss: [],
    }
}

// initial state
const state = getDefaultState()

export const notifications: Module<GuiNotificationState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
