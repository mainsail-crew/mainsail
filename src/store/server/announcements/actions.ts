import Vue from 'vue'
import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { ServerAnnouncementsState } from './types'

export const actions: ActionTree<ServerAnnouncementsState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit('server.announcements.list', {}, { action: 'server/announcements/getList' })
    },

    async getList({ commit, dispatch }, payload) {
        if ('entries' in payload) {
            const entries = payload.entries.map((entry: any) => {
                const date = new Date(entry.date * 1000)
                const date_dismissed = payload.date_dismissed ? new Date(entry.date_dismissed * 1000) : null
                const dismiss_wake = payload.dismiss_wake ? new Date(entry.dismiss_wake * 1000) : null

                return { ...entry, date, date_dismissed, dismiss_wake }
            })

            await commit('setEntries', entries)
        }
        if ('feeds' in payload) await commit('setFeeds', payload.feeds)

        await dispatch('socket/removeInitModule', 'server/announcements/init', { root: true })
    },

    getDismissed({ commit }, payload) {
        commit('setDismissed', { entry_id: payload.entry_id, status: true })
    },

    getWaked({ commit }, payload) {
        commit('setDismissed', { entry_id: payload.entry_id, status: false })
    },

    close(_, payload) {
        Vue.$socket.emit('server.announcements.dismiss', { entry_id: payload.entry_id })
    },

    dismiss(_, payload) {
        Vue.$socket.emit('server.announcements.dismiss', { entry_id: payload.entry_id, wake_time: payload.time })
    },
}
