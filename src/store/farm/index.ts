import { printer } from '@/store/farm/printer'
import { Module } from 'vuex'
import { FarmState } from '@/store/farm/types'
import { RootState } from '@/store/types'
import { GuiRemoteprintersStatePrinter } from '@/store/gui/remoteprinters/types'

export const getDefaultState = (): FarmState => {
    return {}
}

// initial state
const state = () => {
    return getDefaultState()
}

export const farm: Module<FarmState, RootState> = {
    namespaced: true,
    state: state,
    getters: {
        countPrinters: (state) => {
            return Object.keys(state).length
        },
        getPrinters: (state) => {
            return state
        },
        getPrinterName: (state, getters) => (namespace: string) => {
            return getters[namespace + '/getPrinterName']
        },
        getPrinterSocketState: (state, getters) => (namespace: string) => {
            return (
                getters[namespace + '/getPrinterSocketState'] ?? {
                    isConnecting: false,
                    isConnected: false,
                }
            )
        },
        existsPrinter: (state) => (namespace: string) => {
            return Object.keys(state).includes(namespace)
        },
    },
    actions: {
        registerPrinter({ commit, dispatch }, payload) {
            if (!this.hasModule(['farm', payload.id])) {
                this.registerModule(['farm', payload.id], printer)
                commit('farm/' + payload.id + '/setSocketData', { ...payload, _namespace: payload.id }, { root: true })

                if ('settings' in payload)
                    commit('farm/' + payload.id + '/setSettings', payload.settings, { root: true })
                dispatch('farm/' + payload.id + '/connect', {}, { root: true })
            }
        },
        updatePrinter({ commit, dispatch }, payload: { id: string; value: GuiRemoteprintersStatePrinter }): void {
            const id = payload.id
            const value = payload.value

            commit(`${id}/setSocketData`, {
                hostname: value.hostname,
                port: value.port,
                path: value.path,
                isConnecting: true,
            })

            dispatch(`${id}/reconnect`)
        },
        unregisterPrinter({ state }, id) {
            if (id in state) {
                state[id].socket?.instance?.close()
                this.unregisterModule(['farm', id])
            }
        },
    },
    mutations: {},
}
