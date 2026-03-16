import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerSpoolmanState } from './types'
import Vue from 'vue'

export const mutations: MutationTree<ServerSpoolmanState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setActiveSpoolId(state, payload) {
        Vue.set(state, 'active_spool_id', payload)
    },

    setActiveSpool(state, payload) {
        Vue.set(state, 'active_spool', payload)
    },

    setHealth(state, payload) {
        Vue.set(state, 'health', payload)
    },

    setInfo(state, payload) {
        Vue.set(state, 'info', payload)
    },

    setVendors(state, payload) {
        Vue.set(state, 'vendors', payload)
    },

    setSpools(state, payload) {
        Vue.set(state, 'spools', payload)
    },

    setToolSpools(state, payload: Record<number, number | null>) {
        Vue.set(state, 'tool_spools', payload)
    },

    setToolSpool(state, { tool, spool_id }: { tool: number; spool_id: number | null }) {
        Vue.set(state.tool_spools, tool, spool_id)
    },

    setToolSpoolDetail(state, { tool, spool }: { tool: number; spool: any }) {
        Vue.set(state.tool_spool_details, tool, spool)
    },
}
