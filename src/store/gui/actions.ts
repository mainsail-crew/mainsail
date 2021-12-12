import Vue from 'vue'
import {ActionTree} from 'vuex'
import {GuiState} from '@/store/gui/types'
import {RootState} from '@/store/types'
import { getDefaultState } from './index'

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
            dispatch('saveSetting', { name: 'control.style', value: 'cross' })
            Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'control.useCross' })
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
        if (payload.value.console?.customFilters) {
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
            newVal: state.view.gcodefiles
        })
    },

    setGcodefilesShowHiddenFiles({ commit, dispatch, state }, data) {
        commit('setGcodefilesShowHiddenFiles', data)
        dispatch('updateSettings', {
            keyName: 'gcodefiles',
            newVal: state.view.gcodefiles
        })
    },

    setCurrentWebcam({ commit, dispatch, state }, payload) {
        commit('setCurrentWebcam', payload)
        dispatch('updateSettings', {
            keyName: 'webcamSettings.currentCam',
            newVal: state.view.webcam.currentCam
        })
    },

    setTempchartDatasetAdditionalSensorSetting({ commit, dispatch, state }, payload) {
        commit('setTempchartDatasetAdditionalSensorSetting', payload)
        dispatch('updateSettings', {
            keyName: 'tempchart',
            newVal: state.view.tempchart
        })
    },

    async resetMoonrakerDB({ commit, dispatch, rootGetters }, payload) {
        const namespaces: string[] = []
        Object.keys(payload).forEach((element) => {
            if (payload[element] === true) namespaces.push(element)
        })

        for (const namespace of namespaces) {
            if (namespace.startsWith('mainsail') || ['webcams', 'timelapse'].includes(namespace)) {
                const url = rootGetters['socket/getUrl'] + '/server/database/item?namespace=' + namespace

                const response = await fetch(url)
                const objects = await response.json()
                if (objects?.result?.value) {
                    for (const item of Object.keys(objects?.result?.value)) {
                        await fetch(url+'&key='+item, { method: 'DELETE' })
                    }
                }
            } else if (namespace === 'history_jobs') {
                await fetch(rootGetters['socket/getUrl'] + '/server/history/job?all=true', { method: 'DELETE' })
            } else if (namespace === 'history_totals') {
                await fetch(rootGetters['socket/getUrl'] + '/server/history/reset_totals', { method: 'POST' })
            }
        }

        window.location.reload()
    },

    async backupMoonrakerDB({ commit, dispatch, rootGetters }, payload) {
        const namespaces: string[] = []
        Object.keys(payload).forEach((element) => {
            if (payload[element] === true) namespaces.push(element)
        })

        const backup: any = {}
        for (const namespace of namespaces) {
            const url = rootGetters['socket/getUrl'] + '/server/database/item?namespace=' + namespace

            const response = await fetch(url)
            const objects = await response.json()
            if (objects?.result?.value) backup[namespace] = {...objects?.result?.value}
        }

        const element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup)))
        element.setAttribute('download', 'backup-mainsail.json')
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()

        document.body.removeChild(element)
    },

    async restoreMoonrakerDB({ rootGetters }, payload) {
        const namespaces: string[] = []
        Object.keys(payload.dbCheckboxes).forEach((element) => {
            if (payload.dbCheckboxes[element] === true) namespaces.push(element)
        })

        for (const namespace of namespaces) {
            const listUrl = rootGetters['socket/getUrl'] + '/server/database/list'

            let existingNamespaces: string[] = []
            const responseNamespaces = await fetch(listUrl)
            const objectsNamespaces = await responseNamespaces.json()
            if (objectsNamespaces?.result?.namespaces) {
                existingNamespaces = objectsNamespaces?.result?.namespaces
            }

            const baseUrl = rootGetters['socket/getUrl'] + '/server/database/item'
            if (existingNamespaces.includes(namespace)) {
                const url = baseUrl + '?namespace=' + namespace

                const response = await fetch(url)
                const objects = await response.json()
                if (objects?.result?.value) {
                    for (const item of Object.keys(objects?.result?.value)) {
                        await fetch(url + '&key=' + item, {method: 'DELETE'})
                    }
                }
            }

            for (const key of Object.keys(payload.restoreObjects[namespace])) {
                const value = payload.restoreObjects[namespace][key]
                await fetch(baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        namespace,
                        key,
                        value
                    })
                })
            }
        }

        window.location.reload()
    },

    setHistoryColumns({ commit, dispatch, state }, data) {
        commit('setHistoryColumns', data)
        dispatch('updateSettings', {
            keyName: 'history',
            newVal: state.view.history
        })
    },

    hideStatusInHistoryList({ commit, dispatch, state }, name) {
        const array: string[] = [...state.view.history.hidePrintStatus]

        if (!array.includes(name)) {
            array.push(name)
            commit('setHistoryHidePrintStatus', array)

            dispatch('updateSettings', {
                keyName: 'view.history.hidePrintStatus',
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
        const array: string[] = [...state.view.history.hidePrintStatus]

        const index = array.indexOf(name)
        if (index !== -1) {
            array.splice(index, 1)
            commit('setHistoryHidePrintStatus', array)

            dispatch('updateSettings', {
                keyName: 'view.history.hidePrintStatus',
                newVal: array
            })
        }
    },

    resetLayout({ dispatch }, name) {
        const defaultState = getDefaultState()
        // @ts-ignore
        const newVal: any = defaultState.dashboard[name] ?? []

        dispatch('saveSetting', {
            name: 'dashboard.'+name,
            value: newVal
        })
    },

    toggleHideUploadAndPrintBtn({commit, dispatch, state}, payload) {
        commit('toggleHideUploadAndPrintBtn', payload)
        dispatch('updateSettings', {
            keyName: 'uiSettings.boolHideUploadAndPrintButton',
            newVal: state.uiSettings.boolHideUploadAndPrintButton
        })
    }
}