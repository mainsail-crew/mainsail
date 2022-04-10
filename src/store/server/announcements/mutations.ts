import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerAnnouncementsState } from './types'
import Vue from 'vue'

export const mutations: MutationTree<ServerAnnouncementsState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setEntries(state, payload) {
        Vue.set(state, 'entries', payload)
    },

    setFeeds(state, payload) {
        Vue.set(state, 'feeds', payload)
    },

    setDismissed(state, payload) {
        const entries = [...state.entries]
        const index = entries.findIndex((entry) => entry.entry_id === payload.entry_id)
        if (index > -1) {
            entries[index].dismissed = payload.status
            if (!payload.status) {
                entries[index].date_dismissed = null
                entries[index].dismiss_wake = null
            } else entries[index].date_dismissed = new Date()
        }

        Vue.set(state, 'entries', entries)
    },
}
