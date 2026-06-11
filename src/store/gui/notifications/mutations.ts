import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiNotificationState } from './types'

export const mutations: MutationTree<GuiNotificationState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    addDismiss(state, payload) {
        const dismiss = [...state.dismiss]
        dismiss.push(payload)

        state.dismiss = dismiss
    },

    removeDismiss(state, payload) {
        const dismiss = [...state.dismiss]
        const index = dismiss.findIndex(
            (dismiss) =>
                dismiss.id === payload.id && dismiss.category === payload.category && dismiss.type === payload.type
        )
        if (index !== -1) dismiss.splice(index)

        state.dismiss = dismiss
    },
}
