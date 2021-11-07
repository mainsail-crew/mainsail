import { printer } from '@/store/farm/printer'
import { Module } from 'vuex'
import { FarmState } from '@/store/farm/types'
import {RootState} from '@/store/types'

export const getDefaultState = (): FarmState => {
    return {

    }
}

// initial state
const state = () => {
    return getDefaultState()
}

export const farm: Module<FarmState, RootState> = {
    namespaced: true,
    state: state,
    getters: {
        countPrinters: state => {
            return Object.keys(state).length
        },
        getPrinters: state => {
            return state
        },
        getPrinterName: (state, getters) => (namespace: string) => {
            return getters[namespace+'/getPrinterName']
        },
        getPrinterSocketState: (state, getters) => (namespace: string) => {
            return getters[namespace+'/getPrinterSocketState'] ?? {
                isConnecting: false,
                isConnected: false
            }
        }
    },
    actions: {
        /*readStoredPrinters({ rootState, dispatch }) {
            if (rootState.socket?.remoteMode) {
                if (localStorage.getItem('printers')) {
                    try {
                        const json = localStorage.getItem('printers') ?? ''
                        const printers = JSON.parse(json) || []
                        printers.forEach((printer: any) => {
                            dispatch('registerPrinter',{
                                hostname: printer.hostname,
                                port: printer.port,
                                protocol: rootState.socket?.protocol,
                                settings: printer.settings ?? {}
                            })
                        })
                    } catch(e) {
                        localStorage.removeItem('printers')
                    }
                }
            } else {
                rootState.gui?.remote_printers?.forEach((printer: any) => {
                    dispatch('registerPrinter',{
                        hostname: printer.hostname,
                        port: printer.port,
                        webPort: printer.webPort,
                        protocol: rootState.socket?.protocol,
                        settings: printer.settings ?? {}
                    })
                })
            }
        },*/
        /*savePrinters({ rootState, state, dispatch }) {
            const printers: any = []

            if (rootState.socket?.remoteMode) {
                Object.keys(state).forEach((key: string) => {
                    printers.push({
                        hostname: state[key].socket.hostname,
                        port: state[key].socket.port,
                        settings: state[key].settings,
                    })
                })

                localStorage.setItem('printers', JSON.stringify(printers))
            } else {
                Object.keys(state).forEach((key: string) => {
                    printers.push({
                        hostname: state[key].socket.hostname,
                        port: state[key].socket.port,
                        webPort: state[key].socket.webPort,
                        settings: state[key].settings,
                    })
                })

                dispatch('gui/saveSetting', { name: 'remote_printers', value: printers }, { root: true })
            }
        },*/
        registerPrinter({ state, commit, dispatch }, payload) {
            if (!this.hasModule(['farm', payload.id])) {
                this.registerModule(['farm', payload.id], printer)
                commit('farm/'+payload.id+'/setSocketData', {...payload, _namespace: payload.id }, { root: true })

                if ('settings' in payload) commit('farm/'+payload.id+'/setSettings', payload.settings, { root: true })
                dispatch('farm/'+payload.id+'/connect', {}, { root: true })
            }
        },
        updatePrinter({ dispatch, commit }, payload) {
            commit(payload.id+'/setSocketData', {
                hostname: payload.values.hostname,
                port: payload.values.port,
                isConnecting: true,
            })
            dispatch(payload.id+'/reconnect')
        },
        unregisterPrinter({ state }, id) {
            if (id in state) {
				state[id].socket?.instance?.close()
				this.unregisterModule(['farm', id])
            }
        }
    },
    mutations: {

    }
}