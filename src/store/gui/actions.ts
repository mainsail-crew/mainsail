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

    init({ commit, dispatch, rootState }, payload) {
        window.console.debug('init gui')

        //added in V2.1
        if (
            payload.value.dashboard?.control !== undefined &&
            'useCross' in payload.value.dashboard?.control
        ) {
            dispatch('saveSetting', { name: 'dashboard.control.style', value: 'cross' })
            Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'dashboard.control.useCross' })
            delete payload.value.dashboard?.control.useCross
        }

        //added in V2.1
        if (payload.value.webcam) {
            window.console.debug('convert old webcam')

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

        //added in V2.1
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

        //added in V2.1
        if (payload.value.cooldownGcode) {
            window.console.debug('convert old cooldownGcode')

            dispatch('presets/updateCooldownGcode', payload.value.cooldownGcode)
            Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'cooldownGcode' })
            delete payload.value.cooldownGcode
        }

        commit('setData', payload.value)

        // init remote printers, when remoteMode is off
        if (!rootState.socket?.remoteMode) dispatch('farm/readStoredPrinters', {}, { root: true })

        dispatch('printer/init', null, { root: true })
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

    addPreset({ commit, dispatch, state }, payload) {
        commit('addPreset', payload)
        dispatch('updateSettings', {
            keyName: 'presets',
            newVal: state.presets
        })
    },

    updatePreset({ commit, dispatch, state }, payload) {
        commit('updatePreset', payload)
        dispatch('updateSettings', {
            keyName: 'presets',
            newVal: state.presets
        })
    },

    deletePreset({ commit, dispatch, state }, payload) {
        commit('deletePreset', payload)
        dispatch('updateSettings', {
            keyName: 'presets',
            newVal: state.presets
        })
    },

    addConsoleFilter({ commit, dispatch, state }, payload) {
        commit('addConsoleFilter', payload)
        dispatch('updateSettings', {
            keyName: 'console.customFilters',
            newVal: state.console.customFilters
        })
    },

    updateConsoleFilter({ commit, dispatch, state }, payload) {
        commit('updateConsoleFilter', payload)
        dispatch('updateSettings', {
            keyName: 'console.customFilters',
            newVal: state.console.customFilters
        })
    },

    deleteConsoleFilter({ commit, dispatch, state }, payload) {
        commit('deleteConsoleFilter', payload)
        dispatch('updateSettings', {
            keyName: 'console.customFilters',
            newVal: state.console.customFilters
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

    async storeMarcogroup({ commit, dispatch, state }, payload) {
        payload.id = uuid()

        await commit('storeMacrogroup', payload)
        dispatch('updateSettings', {
            keyName: 'dashboard.macrogroups',
            newVal: state.dashboard.macrogroups
        })

        return payload.id
    },

    updateMacrogroup({ commit, dispatch, state }, payload) {
        if (payload.group) {
            commit('updateMacrogroup', payload)
            dispatch('updateSettings', {
                keyName: 'dashboard.macrogroups',
                newVal: state.dashboard.macrogroups
            })

        }
    },

    destroyMacrogroup({ commit, dispatch, state }, payload) {
        commit('destroyMacrogroup', payload)
        dispatch('updateSettings', {
            keyName: 'dashboard.macrogroups',
            newVal: state.dashboard.macrogroups
        })

        const layouts = ['mobileLayout', 'tabletLayout1', 'tabletLayout2', 'desktopLayout1', 'desktopLayout2',
            'widescreenLayout1', 'widescreenLayout2', 'widescreenLayout3']

        layouts.forEach((layoutname: string) => {
            const layoutArray = [...state.dashboard[layoutname]]

            const index = layoutArray.findIndex((layoutPos: any) => layoutPos.name === 'macrogroup_'+payload)
            if (index !== -1) {
                commit('deleteFromDashboardLayout', { layoutname, index })
                dispatch('updateSettings', {
                    keyName: 'dashboard.'+layoutname,
                    newVal: state.dashboard[layoutname]
                })
            }
        })

    },

    addMacroToMacrogroup({ commit, dispatch, state }, payload) {
        if (payload.group) {
            commit('addMacroToMacrogroup', payload)
            dispatch('updateSettings', {
                keyName: 'dashboard.macrogroups',
                newVal: state.dashboard.macrogroups
            })

        }
    },

    updateMacroFromMacrogroup({ commit, dispatch, state }, payload) {
        if (payload.group) {
            commit('updateMacroFromMacrogroup', payload)
            dispatch('updateSettings', {
                keyName: 'dashboard.macrogroups',
                newVal: state.dashboard.macrogroups
            })

        }
    },

    removeMacroFromMacrogroup({ commit, dispatch, state }, payload) {
        if (payload.group) {
            commit('removeMacroFromMacrogroup', payload)
            dispatch('updateSettings', {
                keyName: 'dashboard.macrogroups',
                newVal: state.dashboard.macrogroups
            })

        }
    }
}