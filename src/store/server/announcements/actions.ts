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

    getList({ commit }, payload) {
        if ('entries' in payload) commit('setEntries', payload.entries)
        if ('feeds' in payload) commit('setFeeds', payload.feeds)
    },
}
