import Vue from 'vue'
import { ActionTree } from 'vuex'
import { GuiState, GuiStateLayoutoption } from '@/store/gui/types'
import { RootState } from '@/store/types'
import { getDefaultState } from './index'
import { themeDir } from '@/store/variables'

export const actions: ActionTree<GuiState, RootState> = {
    reset({ commit, dispatch }) {
        commit('reset')

        dispatch('console/reset')
        dispatch('gcodehistory/reset')
        dispatch('macros/reset')
        dispatch('presets/reset')
        dispatch('webcams/reset')
    },

    init() {
        window.console.debug('init gui')
        Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail' }, { action: 'gui/initStore' })
    },

    async initStore({ commit, dispatch, rootGetters, rootState }, payload) {
        const baseUrl = rootGetters['socket/getUrl'] + '/server/database/item'
        const mainsailUrl = baseUrl + '?namespace=mainsail'

        if ('remoteprinters' in payload.value) {
            if (rootState.instancesDB === 'moonraker')
                dispatch('remoteprinters/initStore', payload.value.remoteprinters.printers)
            delete payload.value.remoteprinters
        }

        // delete currentPath if exists
        if (payload.value?.view?.gcodefiles?.currentPath) {
            window.console.debug('remove currentPath from gui namespace')
            await fetch(mainsailUrl + '&key=view.gcodefiles.currentPath', { method: 'DELETE' })
        }

        // delete currentPath if exists
        if (payload.value?.view?.configfiles?.currentPath) {
            window.console.debug('remove currentPath from gui namespace')
            await fetch(mainsailUrl + '&key=view.configfiles.currentPath', { method: 'DELETE' })
        }

        //update cooldownGcode from V2.0.1 to V2.1.0
        if ('cooldownGcode' in payload.value) {
            window.console.debug('update cooldownGcode to new namespace')
            dispatch('saveSetting', { name: 'presets.cooldownGcode', value: payload.value.cooldownGcode })

            await fetch(mainsailUrl + '&key=cooldownGcode', { method: 'DELETE' })
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

        //update nonExpandPanels from V2.1.x to V2.2.0
        if (
            'dashboard' in payload.value &&
            'nonExpandPanels' in payload.value.dashboard &&
            Array.isArray(payload.value.dashboard.nonExpandPanels)
        ) {
            await fetch(mainsailUrl + '&key=dashboard.nonExpandPanels', { method: 'DELETE' })
            dispatch('saveSetting', {
                name: 'dashboard.nonExpandPanels.widescreen',
                value: payload.value.dashboard.nonExpandPanels,
            })
            delete payload.value.dashboard.nonExpandPanels
        }

        //update tools to temperatures panel from V2.1.x to V2.2.0
        if ('dashboard' in payload.value) {
            const dashboard = payload.value.dashboard
            const layouts = [
                'mobileLayout',
                'tabletLayout1',
                'tabletLayout2',
                'desktopLayout1',
                'desktopLayout2',
                'widescreenLayout1',
                'widescreenLayout2',
                'widescreenLayout3',
            ]

            layouts.forEach((layout) => {
                if (layout in dashboard) {
                    const index = dashboard[layout].findIndex((entry: GuiStateLayoutoption) => entry.name === 'tools')

                    if (index !== -1) {
                        dashboard[layout][index].name = 'temperature'

                        dispatch('saveSetting', {
                            name: 'dashboard.' + layout,
                            value: dashboard[layout],
                        })
                    }
                }
            })
        }

        await commit('setData', payload.value)
        await dispatch('socket/removeInitModule', 'gui/init', { root: true })
    },

    /*
     * Create mainsail namespace in moonraker DB and fill in default values
     */
    async initDb({ dispatch, rootGetters }) {
        const baseUrl = rootGetters['socket/getUrl'] + '/server/database/item'

        const urlDefault =
            rootGetters['socket/getUrl'] + '/server/files/config/' + themeDir + '/default.json?time=' + Date.now()
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
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            namespace: key,
                            key: key2,
                            value: defaults[key][key2],
                        }),
                    })
                }
            } else {
                await fetch(baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        namespace: 'mainsail',
                        key: key,
                        value: defaults[key],
                    }),
                })
            }
        }

        await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                namespace: 'mainsail',
                key: 'initVersion',
                value: rootGetters['getVersion'],
            }),
        })

        dispatch('init')
    },

    saveSetting({ commit }, payload) {
        commit('saveSetting', payload)

        Vue.$socket.emit('server.database.post_item', {
            namespace: 'mainsail',
            key: payload.name,
            value: payload.value,
        })
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
        )
            newState = Object.assign(payload.value[keyName], { ...newState })

        Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: keyName, value: newState })
    },

    setGcodefilesMetadata({ commit, dispatch, state }, data) {
        commit('setGcodefilesMetadata', data)
        dispatch('updateSettings', {
            keyName: 'view.gcodefiles.hideMetadataColumns',
            newVal: state.view.gcodefiles.hideMetadataColumns,
        })
    },

    setGcodefilesShowHiddenFiles({ commit, dispatch, state }, data) {
        commit('setGcodefilesShowHiddenFiles', data)
        dispatch('updateSettings', {
            keyName: 'view.gcodefiles.showHiddenFiles',
            newVal: state.view.gcodefiles.showHiddenFiles,
        })
    },

    setCurrentWebcam({ commit, dispatch, state }, payload) {
        commit('setCurrentWebcam', payload)
        dispatch('updateSettings', {
            keyName: 'view.webcam.currentCam',
            newVal: state.view.webcam.currentCam,
        })
    },

    setTempchartDatasetAdditionalSensorSetting({ commit, dispatch, state }, payload) {
        commit('setTempchartDatasetAdditionalSensorSetting', payload)
        dispatch('updateSettings', {
            keyName: 'view.tempchart',
            newVal: state.view.tempchart,
        })
    },

    async resetMoonrakerDB({ rootGetters }, payload) {
        const baseUrl = rootGetters['socket/getUrl'] + '/server/database/item'

        const urlDefault =
            rootGetters['socket/getUrl'] + '/server/files/config/' + themeDir + '/default.json?time=' + Date.now()
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
                        await fetch(url + '&key=' + item, { method: 'DELETE' })
                    }
                }

                if (key in defaults) {
                    for (const key2 of defaults[key]) {
                        await fetch(baseUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                namespace: key,
                                key: key2,
                                value: defaults[key][key2],
                            }),
                        })
                    }
                }
            } else if (key === 'history_jobs') {
                await fetch(rootGetters['socket/getUrl'] + '/server/history/job?all=true', { method: 'DELETE' })
            } else if (key === 'history_totals') {
                await fetch(rootGetters['socket/getUrl'] + '/server/history/reset_totals', { method: 'POST' })
            } else {
                await fetch(rootGetters['socket/getUrl'] + '/server/database/item?namespace=mainsail&key=' + key, {
                    method: 'DELETE',
                })

                if (key in defaults) {
                    await fetch(baseUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            namespace: 'mainsail',
                            key: key,
                            value: defaults[key],
                        }),
                    })
                }
            }
        }

        window.location.reload()
    },

    async backupMoonrakerDB({ rootGetters }, payload) {
        const backup: any = {}

        const responseMainsail = await fetch(rootGetters['socket/getUrl'] + '/server/database/item?namespace=mainsail')
        const objectsMainsail = await responseMainsail.json()
        const mainsailDb = objectsMainsail?.result?.value ?? {}

        for (const key of payload) {
            if (['timelapse', 'webcams'].includes(key)) {
                const url = rootGetters['socket/getUrl'] + '/server/database/item?namespace=' + key

                const response = await fetch(url)
                const objects = await response.json()
                if (objects?.result?.value) backup[key] = { ...objects?.result?.value }
            } else if (key in mainsailDb) {
                backup[key] = { ...mainsailDb[key] }
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
                            await fetch(url + '&key=' + item, { method: 'DELETE' })
                        }
                    }
                }

                for (const key2 of Object.keys(payload.restoreObjects[key])) {
                    const value = payload.restoreObjects[key][key2]
                    await fetch(baseUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            namespace: key,
                            key: key2,
                            value,
                        }),
                    })
                }
            } else {
                if (mainsailArray.includes(key)) await fetch(mainsailUrl + '&key=' + key, { method: 'DELETE' })
                await fetch(mainsailUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        namespace: 'mainsail',
                        key,
                        value: payload.restoreObjects[key],
                    }),
                })
            }
        }

        window.location.reload()
    },

    setHistoryColumns({ commit, dispatch, state }, data) {
        commit('setHistoryColumns', data)
        dispatch('updateSettings', {
            keyName: 'view.history',
            newVal: state.view.history,
        })
    },

    hideStatusInHistoryList({ commit, dispatch, state }, name) {
        const array: string[] = [...state.view.history.hidePrintStatus]

        if (!array.includes(name)) {
            array.push(name)
            commit('setHistoryHidePrintStatus', array)

            dispatch('updateSettings', {
                keyName: 'view.history.hidePrintStatus',
                newVal: array,
            })
        }
    },

    saveExpandPanel({ commit, dispatch, state }, payload) {
        if (!payload.value) commit('addClosePanel', { name: payload.name, viewport: payload.viewport })
        else commit('removeClosePanel', { name: payload.name, viewport: payload.viewport })

        dispatch('updateSettings', {
            keyName: `dashboard.nonExpandPanels.${payload.viewport}`,
            newVal: state.dashboard.nonExpandPanels[payload.viewport],
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
                newVal: array,
            })
        }
    },

    resetLayout({ dispatch }, name) {
        const defaultState = getDefaultState()
        // @ts-ignore
        const newVal: any = defaultState.dashboard[name] ?? []

        dispatch('saveSetting', {
            name: 'dashboard.' + name,
            value: newVal,
        })
    },

    updateGcodeviewerCache({ dispatch, state }, payload) {
        const klipperCache = (state.gcodeViewer.klipperCache as { [key: string]: any }) ?? {}

        Object.keys(payload).forEach((key) => {
            const value = payload[key]
            const oldValue = key in klipperCache ? klipperCache[key] : null

            if (JSON.stringify(value) !== JSON.stringify(oldValue))
                dispatch('saveSetting', { name: `gcodeViewer.klipperCache.${key}`, value })
        })
    },

    announcementDismissFlag(_, payload) {
        window.console.log(payload)
    },

    setChartDatasetStatus(
        { commit, dispatch, state },
        payload: { objectName: string; dataset: string; value: boolean }
    ) {
        commit('setChartDatasetStatus', payload)

        dispatch('updateSettings', {
            keyName: 'view.tempchart.datasetSettings',
            newVal: state.view.tempchart.datasetSettings,
        })
    },

    setDatasetAdditionalSensorStatus(
        { commit, dispatch, state },
        payload: { objectName: string; dataset: string; value: boolean }
    ) {
        commit('setDatasetAdditionalSensorStatus', payload)

        dispatch('updateSettings', {
            keyName: 'view.tempchart.datasetSettings',
            newVal: state.view.tempchart.datasetSettings,
        })
    },

    setChartColor({ commit, dispatch, state }, payload: { objectName: string; value: boolean }) {
        commit('setChartDatasetStatus', {
            objectName: payload.objectName,
            dataset: 'color',
            value: payload.value,
        })

        dispatch('updateSettings', {
            keyName: 'view.tempchart.datasetSettings',
            newVal: state.view.tempchart.datasetSettings,
        })
    },
}
