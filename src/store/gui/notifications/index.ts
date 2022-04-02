import { GuiNotificationState } from './types'
import { Module } from 'vuex'
import { actions } from './actions'
import { mutations } from './mutations'
import { getters } from './getters'

export const getDefaultState = (): GuiNotificationState => {
    return {}
}

// initial state
const state = getDefaultState()

export const notification: Module<GuiNotificationState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
