import { ActionTree } from 'vuex'
import { NotificationState } from '@/store/notification/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<NotificationState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    close({ dispatch }, payload) {
        const posFirstSlash = payload.id.indexOf('/')
        if (posFirstSlash === -1) return

        const type = payload.id.slice(0, posFirstSlash)
        const id = payload.id.slice(posFirstSlash + 1)

        if (type === 'announcement') dispatch('server/announcements/close', { entry_id: id }, { root: true })
    },

    dismiss({ dispatch }, payload) {
        const posFirstSlash = payload.id.indexOf('/')
        if (posFirstSlash === -1) return

        const type = payload.id.slice(0, posFirstSlash)
        const id = payload.id.slice(posFirstSlash + 1)

        if (type === 'announcement') dispatch('server/announcements/dismiss', { entry_id: id }, { root: true })
    },
}
