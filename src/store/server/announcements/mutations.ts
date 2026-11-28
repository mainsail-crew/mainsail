import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerAnnouncementsState, ServerAnnouncementsStateEntry } from './types'
import Vue from 'vue'

export const mutations: MutationTree<ServerAnnouncementsState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    setEntries(state, entries: ServerAnnouncementsStateEntry[]): void {
        Vue.set(state, 'entries', entries)
    },

    setFeeds(state, feeds: string[]): void {
        Vue.set(state, 'feeds', feeds)
    },

    setDismissed(state, payload: { entry_id: string; dismissed: boolean }): void {
        const index = state.entries.findIndex((entry) => entry.entry_id === payload.entry_id)
        if (index === -1) return

        const entry = state.entries[index]
        state.entries.splice(index, 1, {
            ...entry,
            dismissed: payload.dismissed,
            date_dismissed: payload.dismissed ? new Date() : null,
            dismiss_wake: payload.dismissed ? entry.dismiss_wake : null,
        })
    },
}
