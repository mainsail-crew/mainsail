import { ActionTree } from 'vuex'
import { FarmPrinterState } from '@/store/farm/printer/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<FarmPrinterState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    connect({ state, commit, dispatch, getters, rootGetters }) {
        commit('setSocketData', { isConnecting: true })
        const socket = new WebSocket(getters.getSocketUrl)

        socket.onopen = () => {
            commit('setSocketData', {
                instance: socket,
                reconnects: 0,
                isConnecting: false,
                isConnected: true,
            })

            dispatch('sendObj', {
                method: 'server.info',
                action: 'getServerInfo',
            })
        }

        socket.onclose = (e) => {
            if (!rootGetters['farm/existsPrinter'](state._namespace)) return

            if (!e.wasClean && state.socket.reconnects < state.socket.maxReconnects) {
                commit('setSocketData', { reconnects: state.socket.reconnects + 1 })

                setTimeout(() => {
                    dispatch('connect')
                }, state.socket.reconnectInterval)
            } else {
                commit('setSocketData', {
                    isConnecting: false,
                    isConnected: false,
                    reconnects: 0,
                })
            }
        }

        socket.onerror = () => {
            window.console.error('Farm Printer WebSocket Error')
        }

        socket.onmessage = (msg) => {
            const data = JSON.parse(msg.data)
            if (data && data.method) {
                switch (data.method) {
                    case 'notify_status_update':
                        dispatch('getData', data.params[0])
                        break

                    case 'notify_klippy_disconnected':
                        dispatch('disconnectKlippy')
                        break

                    case 'notify_klippy_ready':
                        dispatch('connectKlippy')
                        break
                }
            } else if ('result' in data) {
                const requestIndex = state.socket.wsData.findIndex((item) => item.id === data.id)

                if (
                    requestIndex !== -1 &&
                    state.socket.wsData[requestIndex].action !== undefined &&
                    state.socket.wsData[requestIndex].action !== ''
                ) {
                    let result = data.result
                    if (result === 'ok') result = { result: result }
                    if (typeof result === 'string') result = { result: result }

                    const preload = {}
                    const wsData = state.socket.wsData[requestIndex]
                    if (wsData.actionPreload) Object.assign(preload, wsData.actionPreload)
                    Object.assign(preload, { requestParams: wsData.params })
                    Object.assign(preload, result)

                    dispatch(wsData.action, preload)
                }

                if (requestIndex !== -1) commit('removeWsData', requestIndex)
            }
        }
    },

    reconnect({ state, dispatch }) {
        if (state.socket.instance) state.socket.instance.close()
        dispatch('connect')
    },

    sendObj({ state, commit }, payload) {
        if (state.socket.instance && state.socket.instance.readyState === WebSocket.OPEN) {
            const id = Math.floor(Math.random() * 10000) + 1

            commit('addWsData', {
                id: id,
                action: payload.action,
                params: payload.params || {},
                actionPreload: payload.actionPreload || null,
            })

            state.socket.instance.send(
                JSON.stringify({
                    jsonrpc: '2.0',
                    method: payload.method,
                    params: payload.params || {},
                    id: id,
                })
            )
        }
    },

    connectKlippy({ commit, dispatch }) {
        commit('setKlippyConnected', true)
        dispatch('initPrinter')
    },

    disconnectKlippy({ commit }) {
        commit('setKlippyConnected', false)
    },

    getServerInfo({ commit, dispatch }, payload) {
        commit('setKlippyConnected', payload.klippy_connected)
        dispatch('initPrinter')
    },

    initPrinter({ state, commit, dispatch }) {
        commit('resetData')

        if (state.server.klippy_connected) {
            dispatch('sendObj', {
                method: 'printer.objects.list',
                action: 'getObjectsList',
            })
        }

        dispatch('sendObj', {
            method: 'server.files.list',
            action: 'getConfigDir',
            params: { root: 'config' },
        })

        dispatch('sendObj', {
            method: 'server.database.list',
            action: 'getDatabases',
        })
    },

    getObjectsList({ dispatch }, payload) {
        const allowed = [
            'webhooks',
            'print_stats',
            'virtual_sdcard',
            'display_status',
            'heaters',
            'heater_bed',
            'heater_fan',
            'fan',
            'temperature_fan',
            'temperature_sensor',
            'idle_timeout',
            'toolhead',
        ]

        let subscripts = {}
        payload.objects?.forEach((object: string) => {
            const splits = object.split(' ')
            const objectName = splits[0]

            if (allowed.includes(objectName) || objectName.startsWith('extruder')) {
                subscripts = { ...subscripts, [object]: null }
            }
        })

        if (Object.keys(subscripts).length > 0)
            dispatch('sendObj', {
                method: 'printer.objects.subscribe',
                params: { objects: subscripts },
                action: 'getData',
            })
    },

    getData({ commit, dispatch }, payload) {
        const data = 'status' in payload ? { ...payload.status } : { ...payload }
        commit('setData', data)

        if ((data.print_stats?.filename ?? '') !== '') {
            dispatch('sendObj', {
                method: 'server.files.metadata',
                params: { filename: data.print_stats?.filename },
                action: 'getMetadataCurrentFile',
            })
        }
    },

    setSettings({ commit, dispatch, state }, payload) {
        commit('setSettings', payload)
        dispatch(
            'gui/remoteprinters/updateSettings',
            {
                id: state._namespace,
                values: state.settings,
            },
            { root: true }
        )
    },

    getMetadataCurrentFile({ commit }, payload) {
        commit('setCurrentFile', payload)
    },

    getConfigDir({ commit }, payload) {
        commit('setConfigDir', payload)
    },

    getDatabases({ commit, dispatch }, payload) {
        commit('setDatabases', payload.namespaces)

        if (payload.namespaces.includes('mainsail')) {
            dispatch('sendObj', {
                method: 'server.database.get_item',
                params: { namespace: 'mainsail' },
                action: 'getMainsailData',
            })
        }

        dispatch('sendObj', {
            method: 'server.webcams.list',
            action: 'getWebcamsData',
        })
    },

    getMainsailData({ commit }, payload) {
        commit('setMainsailData', payload.value)
    },

    getWebcamsData({ commit }, payload) {
        commit('setWebcamsData', payload.webcams)
    },
}
