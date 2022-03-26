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
}
