import { ActionTree } from 'vuex'
import { GuiNotificationState, GuiNotificationStateDismissEntry } from './types'
import { RootState } from '../../types'
import Vue from 'vue'

export const actions: ActionTree<GuiNotificationState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    upload({ state }) {
        Vue.$socket.emit('server.database.post_item', {
            namespace: 'mainsail',
            key: 'notifications.dismiss',
            value: state.dismiss,
        })
    },

    close({ dispatch }, payload) {
        const posFirstSlash = payload.id.indexOf('/')
        if (posFirstSlash === -1) return

        const category = payload.id.slice(0, posFirstSlash)
        const id = payload.id.slice(posFirstSlash + 1)

        if (category === 'announcement') {
            dispatch('server/announcements/close', { entry_id: id }, { root: true })
            return
        }

        dispatch('storeDismiss', {
            entry_id: id,
            category,
            type: 'ever',
            time: null,
        })
    },

    dismiss({ dispatch }, payload) {
        const posFirstSlash = payload.id.indexOf('/')
        if (posFirstSlash === -1) return

        const category = payload.id.slice(0, posFirstSlash)
        const id = payload.id.slice(posFirstSlash + 1)

        if (category === 'announcement') {
            dispatch('server/announcements/dismiss', { entry_id: id, time: payload.time }, { root: true })
            return
        }

        dispatch('storeDismiss', {
            entry_id: id,
            category,
            type: payload.type,
            time: payload.time,
        })
    },

    async storeDismiss(
        { commit, dispatch, state },
        payload: { entry_id: string; category: string; type: string; time: number | null }
    ) {
        let date = new Date().getTime()
        if (payload.type === 'time') {
            date = new Date().getTime() + (payload.time ?? 0) * 1000
        }

        const newDismiss: GuiNotificationStateDismissEntry = {
            id: payload.entry_id,
            category: payload.category,
            type: payload.type,
            date,
        }

        if (
            state.dismiss.filter(
                (dismiss) =>
                    dismiss.id === newDismiss.id &&
                    dismiss.category === newDismiss.category &&
                    dismiss.type === newDismiss.type
            ).length
        ) {
            await commit('removeDismiss', newDismiss)
        }

        await commit('addDismiss', newDismiss)
        await dispatch('upload')
    },
}
