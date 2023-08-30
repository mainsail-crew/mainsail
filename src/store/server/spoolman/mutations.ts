import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerSpoolmanState } from './types'
import Vue from 'vue'

export const mutations: MutationTree<ServerSpoolmanState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setSpoolId(state, payload) {
        Vue.set(state, 'spool_id', payload)
    },

    setInfo(state, payload) {
        Vue.set(state, 'info', payload)
    },

    setVendors(state, payload) {
        Vue.set(state, 'vendors', payload)
    },
}
