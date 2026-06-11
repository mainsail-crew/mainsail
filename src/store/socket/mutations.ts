import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { SocketState } from '@/store/socket/types'

export const mutations: MutationTree<SocketState> = {
    reset(state) {
        const defaults = getDefaultState()

        state.initializationList = defaults.initializationList
    },

    setConnected(state) {
        state.isConnected = true
        state.isConnecting = false
        state.connectingFailed = false
    },

    setDisconnected(state, message?: string) {
        state.isConnected = false
        state.isConnecting = false
        state.connectingFailed = true
        state.connection_id = null

        if (message) state.connectionFailedMessage = message
    },

    setData(state, payload) {
        if ('socket' in payload) payload = payload.socket

        Object.entries(payload).forEach(([key, value]) => {
            state[key] = value
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
        if (state.loadings.length) state.loadings = []
    },

    addInitModule(state, payload) {
        const list = [...state.initializationList]
        const index = list.indexOf(payload)
        if (index > -1) return

        list.push(payload)
        state.initializationList = list
    },

    removeInitModule(state, payload) {
        const list = [...state.initializationList]
        const index = list.indexOf(payload)
        if (index === -1) return

        list.splice(index, 1)
        state.initializationList = list
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

        state.initializationList = list
    },
}
