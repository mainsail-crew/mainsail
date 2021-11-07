import { ActionTree } from 'vuex'
import {RootState} from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import {GuiRemoteprintersState} from '@/store/gui/remoteprinters/types'

export const actions: ActionTree<GuiRemoteprintersState, RootState> = {
    reset({ commit, dispatch, state }) {
        Object.keys(state.remoteprinters).forEach((printerId) => {
            dispatch('farm/unregisterPrinter', printerId, { root: true })
        })

        commit('reset')
    },

    init() {
        window.console.debug('init gui/remoteprinters')
        Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail_remoteprinters' }, { action: 'gui/remoteprinters/initStore' })
    },

    initFromLocalstorage({ dispatch }) {
        window.console.debug('init gui/remoteprinters from localStorage')

        const value = JSON.parse(localStorage.getItem('printers') ?? '{}')
        if (Array.isArray(value)) {
            const printers: any = {}

            value.forEach((printer) => {
                const id = uuidv4()
                printers[id] = printer
            })

            dispatch('initStore', { value: printers })
        } else dispatch('initStore', { value })
    },

    async initStore({ commit, dispatch, state }, payload) {
        dispatch('reset')

        Object.keys(payload.value).forEach((printerId: string) => {
            const printer = payload.value[printerId]
            commit('store', { id: printerId, values: printer })
            dispatch('farm/registerPrinter', {
                id: printerId,
                hostname: printer.hostname ?? '',
                port: printer.port ?? 7125,
                settings: printer.settings ?? {}
            }, { root: true })
        })
    },

    upload({ state, rootState }, id) {
        if (rootState.socket?.remoteMode) {
            const printers: any[] = []

            Object.keys(state.remoteprinters).forEach((id: string) => {
                printers.push({
                    hostname: state.remoteprinters[id].hostname,
                    port: state.remoteprinters[id].port,
                    settings: state.remoteprinters[id].settings,
                })
            })

            localStorage.setItem('printers', JSON.stringify(printers))
        } else if (id in state.remoteprinters) {
            const value = {
                hostname: state.remoteprinters[id].hostname,
                port: state.remoteprinters[id].port,
                settings: state.remoteprinters[id].settings ?? {},
            }

            Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail_remoteprinters', key: id, value })
        }
    },

    store({ commit, dispatch, state }, payload) {
        const id = uuidv4()

        commit('store', { id, values: payload.values })
        dispatch('farm/registerPrinter', {
            id,
            hostname: payload.values.hostname ?? '',
            port: payload.values.port ?? 7125
        }, { root: true })

        dispatch('upload', id)
    },

    update({ commit, dispatch, state }, payload) {
        commit('update', payload)
        dispatch('farm/updatePrinter', payload, { root: true })

        dispatch('upload', payload.id)
    },

    updateSettings({ commit, dispatch }, payload) {
        commit('update', {
            id: payload.id,
            values: {
                settings: payload.values
            }
        })
        dispatch('upload', payload.id)
    },

    delete({ commit, dispatch }, id) {
        commit('delete', id)
        dispatch('farm/unregisterPrinter', id, { root: true })

        Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail_remoteprinters', key: id })
    },
}