import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiNotificationState, GuiNotificationStateDismissEntry } from './types'
import Vue from 'vue'

export const mutations: MutationTree<GuiNotificationState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    addDismiss(state, payload: GuiNotificationStateDismissEntry) {
        Vue.set(state, 'dismiss', [...state.dismiss, payload])
    },

    removeDismiss(state, payload: GuiNotificationStateDismissEntry) {
        const dismiss = [...state.dismiss].filter(
            (d) => !(d.id === payload.id && d.category === payload.category && d.type === payload.type)
        )

        Vue.set(state, 'dismiss', dismiss)
    },
}
