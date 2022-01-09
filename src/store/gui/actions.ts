import Vue from 'vue'
import {ActionTree} from 'vuex'
import {GuiState} from '@/store/gui/types'
import {RootState} from '@/store/types'
import { getDefaultState } from './index'
import {themeDir} from '@/store/variables'

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

    async initStore({ commit, dispatch, rootGetters, rootState }, payload) {
        const baseUrl = rootGetters['socket/getUrl'] + '/server/database/item'
        const mainsailUrl = baseUrl + '?namespace=mainsail'

        if ('remoteprinters' in payload.value) {
            if (!rootState.socket?.remoteMode) dispatch('remoteprinters/initStore', payload.value.remoteprinters.printers)
            delete payload.value.remoteprinters
        }

        //update cooldownGcode from V2.0.1 to V2.1.0
        if ('cooldownGcode' in payload.value) {
            window.console.debug('update cooldownGcode to new namespace')
            dispatch('saveSetting', { name: 'presets.cooldownGcode', value: payload.value.cooldownGcode })

            await fetch(mainsailUrl+'&key=cooldownGcode', { method: 'DELETE' })
            delete payload.value.cooldownGcode
        }

        //update presets from V2.0.1 to V2.1.0
        if ('presets' in payload.value && Array.isArray(payload.value.presets)) {
            window.console.debug('update presets to new namespace')

            payload.value.presets.forEach((preset: any) => {
                dispatch('presets/store', { values: preset })
            })

            delete payload.value.presets
        }

        commit('setData', payload.value)
    },

    /*
     * Create mainsail namespace in moonraker DB and fill in default values
     */
    async initDb({ dispatch, rootGetters }) {
        const baseUrl = rootGetters['socket/getUrl'] + '/server/database/item'

        const urlDefault = rootGetters['socket/getUrl'] + '/server/files/config/' + themeDir + '/default.json?time=' + Date.now()
        const responseDefault = await fetch(urlDefault)
        let defaults: any = {}
        if (responseDefault) {
            defaults = await responseDefault.json()
            if (defaults.error?.code === 404) defaults = {}
        }

        for (const key in defaults) {
            if (['webcams', 'timelapse'].includes(key)) {
                for (const key2 of defaults[key]) {
                    await fetch(baseUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            namespace: key,
                            key: key2,
                            value: defaults[key][key2]
                        })
                    })
                }
            } else {
                await fetch(baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        namespace: 'mainsail',
                        key: key,
                        value: defaults[key]
                    })
                })
            }
        }

        await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                namespace: 'mainsail',
                key: 'initVersion',
                value: rootGetters['getVersion']
            })
        })

        dispatch('init')
    },

    saveSetting({ commit }, payload) {
        commit('saveSetting', payload)

        Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: payload.name, value: payload.value })
    },

    saveSettingWithoutUpload({ commit }, payload) {
        commit('saveSetting', payload)
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
            keyName: 'view.gcodefiles',
            newVal: state.view.gcodefiles
        })
    },

    setGcodefilesShowHiddenFiles({ commit, dispatch, state }, data) {
        commit('setGcodefilesShowHiddenFiles', data)
        dispatch('updateSettings', {
            keyName: 'view.gcodefiles',
            newVal: state.view.gcodefiles
        })
    },

    setCurrentWebcam({ commit, dispatch, state }, payload) {
        commit('setCurrentWebcam', payload)
        dispatch('updateSettings', {
            keyName: 'view.webcam.currentCam',
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
        const baseUrl = rootGetters['socket/getUrl'] + '/server/database/item'

        const urlDefault = rootGetters['socket/getUrl'] + '/server/files/config/' + themeDir + '/default.json?time=' + Date.now()
        const responseDefault = await fetch(urlDefault)
        let defaults: any = {}
        if (responseDefault) {
            defaults = await responseDefault.json()
            if (defaults.error?.code === 404) defaults = {}
        }

        for (const key of payload) {
            if (['webcams', 'timelapse'].includes(key)) {
                const url = baseUrl + '?namespace=' + key

                const response = await fetch(url)
                const objects = await response.json()
                if (objects?.result?.value) {
                    for (const item of Object.keys(objects?.result?.value)) {
                        await fetch(url+'&key='+item, { method: 'DELETE' })
                    }
                }

                if (key in defaults) {
                    for (const key2 of defaults[key]) {
                        await fetch(baseUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                namespace: key,
                                key: key2,
                                value: defaults[key][key2]
                            })
                        })
                    }
                }
            } else if (key === 'history_jobs') {
                await fetch(rootGetters['socket/getUrl'] + '/server/history/job?all=true', { method: 'DELETE' })
            } else if (key === 'history_totals') {
                await fetch(rootGetters['socket/getUrl'] + '/server/history/reset_totals', { method: 'POST' })
            } else {
                await fetch(rootGetters['socket/getUrl'] + '/server/database/item?namespace=mainsail&key=' + key, { method: 'DELETE' })

                if (key in defaults) {
                    await fetch(baseUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            namespace: 'mainsail',
                            key: key,
                            value: defaults[key]
                        })
                    })
                }
            }
        }

        window.location.reload()
    },

    async backupMoonrakerDB({ commit, dispatch, rootGetters }, payload) {
        const backup: any = {}

        const responseMainsail = await fetch(rootGetters['socket/getUrl'] + '/server/database/item?namespace=mainsail')
        const objectsMainsail = await responseMainsail.json()
        const mainsailDb = objectsMainsail?.result?.value ?? {}

        for (const key of payload) {
            if (['timelapse', 'webcams'].includes(key)) {
                const url = rootGetters['socket/getUrl'] + '/server/database/item?namespace=' + key

                const response = await fetch(url)
                const objects = await response.json()
                if (objects?.result?.value) backup[key] = {...objects?.result?.value}
            } else if (key in mainsailDb) {
                backup[key] = {...mainsailDb[key]}
            }
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
        const baseUrl = rootGetters['socket/getUrl'] + '/server/database/item'
        const mainsailUrl = baseUrl + '?namespace=mainsail'
        const responseNamespaces = await fetch(rootGetters['socket/getUrl'] + '/server/database/list')
        const objectsNamespaces = await responseNamespaces.json()
        const namespacesArray = objectsNamespaces?.result?.namespaces ?? []
        let mainsailArray: string[] = []

        if (namespacesArray.includes('mainsail')) {
            const responseMainsail = await fetch(mainsailUrl)
            const objectsMainsail = await responseMainsail.json()
            mainsailArray = Object.keys(objectsMainsail?.result?.value ?? {})
        }

        for (const key of payload.dbCheckboxes) {
            if (['timelapse', 'webcams'].includes(key)) {
                if (namespacesArray.includes(key)) {
                    const url = baseUrl + '?namespace=' + key
                    const response = await fetch(url)
                    const objects = await response.json()
                    if (objects?.result?.value) {
                        for (const item of Object.keys(objects?.result?.value)) {
                            await fetch(url + '&key=' + item, {method: 'DELETE'})
                        }
                    }
                }

                for (const key2 of Object.keys(payload.restoreObjects[key])) {
                    const value = payload.restoreObjects[key][key2]
                    await fetch(baseUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            namespace: key,
                            key: key2,
                            value
                        })
                    })
                }
            } else {
                if (mainsailArray.includes(key)) await fetch(mainsailUrl+'&key='+key, { method: 'DELETE' })
                await fetch(mainsailUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        namespace: 'mainsail',
                        key,
                        value: payload.restoreObjects[key]
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
}