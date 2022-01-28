import Vue from 'vue'
import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import { SocketState } from '@/store/socket/types'

export const mutations: MutationTree<SocketState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setConnected (state) {
        Vue.set(state, 'isConnected', true)
        Vue.set(state, 'isConnecting', false)
        Vue.set(state, 'connectingFailed', false)
    },

    setDisconnected (state) {
        Vue.set(state, 'isConnected', false)
        Vue.set(state, 'isConnecting', false)
        Vue.set(state, 'connectingFailed', true)
    },

    setData(state, payload) {
        if ('socket' in payload) payload = payload.socket

        Object.entries(payload).forEach(([key, value]) => {
            Vue.set(state, key, value)
        })
    },

    addLoading(state, payload) {
        state.loadings.push(payload.name)
    },

    removeLoading(state, payload) {
        const index = state.loadings.indexOf(payload.name)
        if (index > -1) state.loadings.splice(index, 1)
    },

    clearLoadings(state) {
        if(state.loadings.length) state.loadings.splice(0, state.loadings.length)
    }
}