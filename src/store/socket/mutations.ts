import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { SocketState } from '@/store/socket/types'

export const mutations: MutationTree<SocketState> = {
    reset(state) {
        const defaults = getDefaultState()

        Vue.set(state, 'initializationList', defaults.initializationList)
    },

    setConnected(state) {
        Vue.set(state, 'isConnected', true)
        Vue.set(state, 'isConnecting', false)
        Vue.set(state, 'connectingFailed', false)
    },

    setDisconnected(state) {
        Vue.set(state, 'isConnected', false)
        Vue.set(state, 'isConnecting', false)
        Vue.set(state, 'connectingFailed', true)
        Vue.set(state, 'connection_id', null)
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
        if (state.loadings.length) Vue.set(state, 'loadings', [])
    },

    addInitModule(state, payload) {
        const list = [...state.initializationList]
        const index = list.indexOf(payload)
        if (index > -1) return

        list.push(payload)
        Vue.set(state, 'initializationList', list)
    },

    removeInitModule(state, payload) {
        const list = [...state.initializationList]
        const index = list.indexOf(payload)
        if (index === -1) return

        list.splice(index, 1)
        Vue.set(state, 'initializationList', list)
    },

    removeInitComponent(state, payload) {
        const list = [...state.initializationList]

        // remove all components witch starts with payload
        const indexes = list.reduce((acc: number[], item, index) => {
            if (item.startsWith(payload)) acc.push(index)
            return acc
        }, [])

        // stop if no items found
        if (!indexes.length) return

        // remove all items
        indexes.forEach((index) => list.splice(index, 1))

        Vue.set(state, 'initializationList', list)
    },
}
