import Vue from 'vue'
import {ActionTree} from 'vuex'
import {GuiState} from '@/store/gui/types'
import {RootState} from '@/store/types'
import { getDefaultState } from './index'

export const actions: ActionTree<GuiState, RootState> = {
    reset({ commit, dispatch }) {
        commit('reset')

        dispatch('console/reset')
        dispatch('gcodehistory/reset')
        dispatch('macros/reset')
        dispatch('presets/reset')
    },

    init() {
        window.console.debug('init gui')
        Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail' }, { action: 'gui/initStore'})
    },

    initStore({ commit, dispatch, rootState }, payload) {
        if ('remoteprinters' in payload.value) {
            if (!rootState.socket?.remoteMode) dispatch('remoteprinters/initStore', payload.value.remoteprinters.printers)
            delete payload.value.remoteprinters
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
            keyName: 'view.tempchart',
            newVal: state.view.tempchart
        })
    },

    async resetMoonrakerDB({ commit, dispatch, rootGetters }, payload) {
        const namespaces: string[] = []
        Object.keys(payload).forEach((element) => {
            if (payload[element] === true) namespaces.push(element)
        })

        for (const namespace of namespaces) {
            if (['mainsail', 'webcams', 'timelapse'].includes(namespace)) {
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
            keyName: 'view.history',
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