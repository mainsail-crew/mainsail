import Vue from 'vue'
import {ActionTree} from 'vuex'
import {GuiState} from '@/store/gui/types'
import {RootState} from '@/store/types'
import { getDefaultState } from './index'
import {v4 as uuid} from 'uuid'

export const actions: ActionTree<GuiState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        window.console.debug('init gui')
        Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail' }, { action: 'gui/initStore'})
    },

    initStore({ commit, dispatch, rootState }, payload) {

        //added in V2.1.0
        if (
            payload.value.dashboard?.control !== undefined &&
            'useCross' in payload.value.dashboard?.control
        ) {
            dispatch('saveSetting', { name: 'dashboard.control.style', value: 'cross' })
            Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'dashboard.control.useCross' })
            delete payload.value.dashboard?.control.useCross
        }

        //added in V2.1.0
        if (payload.value.webcam) {
            window.console.debug('convert old webcams')

            if (payload.value.webcam.configs && payload.value.webcam.configs.length) {
                payload.value.webcam.configs.forEach((oldWebcam: any) => {
                    const newWebcam = {...oldWebcam, urlStream: oldWebcam.url, urlSnapshot: oldWebcam.url.replace('action=stream', 'action=snapshot')}
                    delete newWebcam.url
                    dispatch('webcam/store', { values: newWebcam })
                })
            }

            commit('saveSetting', { name: 'webcamSettings.boolNavi', value: payload.value.webcam.boolNavi })
            Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'webcam' })
        }

        //added in V2.1.0
        if (payload.value.presets) {
            window.console.debug('convert old presets')

            if (payload.value.presets && payload.value.presets.length) {
                payload.value.presets.forEach((oldPreset: any) => {
                    dispatch('presets/store', { values: oldPreset })
                })

                delete payload.value.presets
            }

            Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'presets' })
        }

        //added in V2.1.0
        if (payload.value.cooldownGcode) {
            window.console.debug('convert old cooldownGcode')

            dispatch('presets/updateCooldownGcode', payload.value.cooldownGcode)
            Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'cooldownGcode' })
            delete payload.value.cooldownGcode
        }

        //added in V2.1.0
        if (payload.value.console.customFilters) {
            window.console.debug('convert old consolefilters')

            if (payload.value.console.customFilters && payload.value.console.customFilters.length) {
                payload.value.console.customFilters.forEach((oldFilter: any) => {
                    dispatch('consolefilters/store', {values: oldFilter})
                })
            }

            delete payload.value.console.customFilters
            Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'console.customFilters' })
        }

        //added in V2.1.0
        if (payload.value.remote_printers) {
            if (!rootState.socket?.remoteMode) {
                window.console.debug('convert old remotePrinters')

                payload.value.remote_printers.forEach((printer: any) => {
                    const values = {
                        hostname: printer.hostname ?? '',
                        port: printer.port ?? 7125,
                        settings: printer.settings ?? {},
                    }
                    dispatch('remoteprinters/store', { values })
                })

                Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'remote_printers' })
            }

            delete payload.value.remote_printers
        }

        //added in V2.1.0
        if (payload.value.dashboard?.macrogroups) {
            window.console.debug('convert old macrogroups')

            payload.value.dashboard?.macrogroups.forEach((macrogroup: any) => {
                dispatch('macrogroups/store', { values: macrogroup })
            })

            Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'dashboard.macrogroups' })

            delete payload.value.dashboard.macrogroups
        }

        commit('setData', payload.value)
    },

    saveSetting({ commit }, payload) {
        commit('saveSetting', payload)

        Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: payload.name, value: payload.value })
    },

    updateSettings(_, payload) {
        const keyName = payload.keyName
        let newState = payload.newVal
        if (
            'value' in payload &&
			keyName in payload.value &&
			typeof payload.value[keyName] !== 'string' &&
			!Array.isArray(payload.value[keyName])
        ) newState = Object.assign(payload.value[keyName], {...newState})

        Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: keyName, value: newState })
    },

    setGcodefilesMetadata({ commit, dispatch, state }, data) {
        commit('setGcodefilesMetadata', data)
        dispatch('updateSettings', {
            keyName: 'gcodefiles',
            newVal: state.gcodefiles
        })
    },

    setGcodefilesShowHiddenFiles({ commit, dispatch, state }, data) {
        commit('setGcodefilesShowHiddenFiles', data)
        dispatch('updateSettings', {
            keyName: 'gcodefiles',
            newVal: state.gcodefiles
        })
    },

    setCurrentWebcam({ commit, dispatch, state }, payload) {
        commit('setCurrentWebcam', payload)
        dispatch('updateSettings', {
            keyName: 'webcamSettings.currentCam',
            newVal: state.webcamSettings.currentCam
        })
    },

    setTempchartDatasetAdditionalSensorSetting({ commit, dispatch, state }, payload) {
        commit('setTempchartDatasetAdditionalSensorSetting', payload)
        dispatch('updateSettings', {
            keyName: 'tempchart',
            newVal: state.tempchart
        })
    },

    resetMoonrakerDB() {
        Vue.$socket.emit('server.database.list', { }, { action: 'gui/resetMoonrakerDB2' })
    },

    resetMoonrakerDB2(_, payload) {
        if ('namespaces' in payload && payload.namespaces.includes('mainsail')) {
            Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail' }, { action: 'gui/resetMoonrakerDB3' })
        }
    },

    resetMoonrakerDB3(_, payload) {
        if ('value' in payload && Object.keys(payload.value).length) {
            Object.keys(payload.value).forEach(key => {
                Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: key })
            })

            window.location.reload()
        }
    },

    setHistoryColumns({ commit, dispatch, state }, data) {
        commit('setHistoryColumns', data)
        dispatch('updateSettings', {
            keyName: 'history',
            newVal: state.history
        })
    },

    hideStatusInHistoryList({ commit, dispatch, state }, name) {
        const array: string[] = [...state.history.hidePrintStatus]

        if (!array.includes(name)) {
            array.push(name)
            commit('setHistoryHidePrintStatus', array)

            dispatch('updateSettings', {
                keyName: 'history.hidePrintStatus',
                newVal: array
            })
        }
    },

    saveExpandPanel({ commit, dispatch, state }, payload) {
        if (!payload.value) commit('addClosePanel', { name: payload.name })
        else commit('removeClosePanel', { name: payload.name })

        dispatch('updateSettings', {
            keyName: 'dashboard.nonExpandPanels',
            newVal: state.dashboard.nonExpandPanels
        })
    },

    showStatusInHistoryList({ commit, dispatch, state }, name) {
        const array: string[] = [...state.history.hidePrintStatus]

        const index = array.indexOf(name)
        if (index !== -1) {
            array.splice(index, 1)
            commit('setHistoryHidePrintStatus', array)

            dispatch('updateSettings', {
                keyName: 'history.hidePrintStatus',
                newVal: array
            })
        }
    },

    resetLayout({ dispatch }, name) {
        const defaultState = getDefaultState()
        // eslint-disable-next-line
		const newVal: any = defaultState.dashboard[name] ?? []

        dispatch('saveSetting', {
            name: 'dashboard.'+name,
            value: newVal
        })
    },
}