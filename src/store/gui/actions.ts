import Vue from 'vue'
import { ActionTree } from 'vuex'
import { GuiState, GuiStateInitPayload, GuiViewport } from '@/store/gui/types'
import { RootState } from '@/store/types'
import { getDefaultState } from './index'
import { excludeKeys, themeDir } from '@/store/variables'
import { deletePath } from '@/plugins/helpers'

const LOG_PREFIX = '[GUI]'
const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

export const actions: ActionTree<GuiState, RootState> = {
    reset({ commit, dispatch }) {
        commit('reset')

        dispatch('console/reset')
        dispatch('gcodehistory/reset')
        dispatch('macros/reset')
        dispatch('presets/reset')
        dispatch('webcams/reset')
    },

    async init({ commit, dispatch, rootGetters, rootState }) {
        logDebug('init')

        let values: GuiStateInitPayload = {}
        try {
            const payload = await Vue.$socket.emitAndWait('server.database.get_item', { namespace: 'mainsail' })
            values = payload.value as GuiStateInitPayload
        } catch (error) {
            logDebug('create Mainsail namespace')

            values = await this.dispatch('gui/getDefaults')
            values.initVersion = rootGetters['getVersion']

            dispatch('restoreValues', values)
        }

        if ('remoteprinters' in values) {
            if (rootState.instancesDB === 'moonraker') {
                dispatch('remoteprinters/initStore', values.remoteprinters?.printers ?? {})
            }
            delete values.remoteprinters
        }

        for (const key of excludeKeys) {
            const parts = key.split('.')
            let value: any = values

            for (const part of parts) {
                if (value === undefined || value === null) break
                value = value[part]
            }

            if (value === undefined || value === null) continue

            logDebug(`remove ${key} from gui namespace`)
            await dispatch('deleteSetting', key)
            deletePath(values, key)
        }

        commit('setData', values)

        // TODO: convert to async module initialization
        dispatch('socket/addInitModule', 'gui/webcam/init', { root: true })
        dispatch('gui/webcams/init', null, { root: true })
    },

    async getDefaults({ rootGetters }) {
        const urlDefaultJson =
            rootGetters['socket/getUrl'] + '/server/files/config/' + themeDir + '/default.json?time=' + Date.now()

        let defaults: any = {}
        try {
            defaults = await fetch(urlDefaultJson).then((result) => result.json())
            if (defaults.error?.code === 404) logDebug('default.json not found')

            if ('error' in defaults) return {}
        } catch (error) {
            logError('Error while parsing default.json', error)
        }

        return defaults
    },

    async restoreValues(_, values) {
        const keys = Object.keys(values)

        // these keys are handled separately, because they are in their own namespaces and not a child of mainsail
        const ownNamespaces = ['timelapse', 'webcams']
        const ownNamespaceKeys = keys.filter((key) => ownNamespaces.includes(key))
        const mainsailKeys = keys.filter((key) => !ownNamespaces.includes(key))

        for (const key of ownNamespaceKeys) {
            const subKeys = Object.keys(values[key])
            for (const subKey of subKeys) {
                const value = values[key][subKey]
                await Vue.$socket.emitAndWait('server.database.post_item', {
                    namespace: key,
                    key: subKey,
                    value,
                })
            }
        }

        for (const key of mainsailKeys) {
            const value = values[key]
            await Vue.$socket.emitAndWait('server.database.post_item', { namespace: 'mainsail', key, value })
        }
    },

    async saveSetting({ commit }, payload) {
        commit('saveSetting', payload)
        if (excludeKeys.includes(payload.name)) return

        await Vue.$socket.emitAndWait('server.database.post_item', {
            namespace: 'mainsail',
            key: payload.name,
            value: payload.value,
        })
    },

    async updateSettings(_, payload) {
        const keyName = payload.keyName
        let newState = payload.newVal
        if (
            'value' in payload &&
            keyName in payload.value &&
            typeof payload.value[keyName] !== 'string' &&
            !Array.isArray(payload.value[keyName])
        )
            newState = Object.assign(payload.value[keyName], { ...newState })

        await Vue.$socket.emitAndWait('server.database.post_item', {
            namespace: 'mainsail',
            key: keyName,
            value: newState,
        })
    },

    async deleteSetting(_, key: string) {
        await Vue.$socket.emitAndWait('server.database.delete_item', { namespace: 'mainsail', key })
    },

    async resetMoonrakerDB({ rootGetters }, payload) {
        const urlDefault =
            rootGetters['socket/getUrl'] + '/server/files/config/' + themeDir + '/default.json?time=' + Date.now()

        let defaults: any = {}
        try {
            defaults = await fetch(urlDefault).then((result) => result.json())
        } catch (error) {
            window.console.error('Error while fetching/parsing default.json', error)
            defaults = {}
        }

        for (const key of payload) {
            if (['maintenance', 'timelapse', 'webcams'].includes(key)) {
                const objects = await Vue.$socket.emitAndWait('server.database.get_item', { namespace: key })

                if (objects?.value) {
                    for (const item of Object.keys(objects?.value)) {
                        await Vue.$socket.emitAndWait('server.database.delete_item', { namespace: key, key: item })
                    }
                }

                if (!(key in defaults)) continue

                for (const key2 of defaults[key]) {
                    await Vue.$socket.emitAndWait('server.database.post_item', {
                        namespace: key,
                        key: key2,
                        value: defaults[key][key2],
                    })
                }

                continue
            }

            if (key === 'history_jobs') {
                await Vue.$socket.emitAndWait('server.history.delete_job', { all: true })
                continue
            }

            if (key === 'history_totals') {
                await Vue.$socket.emitAndWait('server.history.reset_totals')
                continue
            }

            await Vue.$socket.emitAndWait('server.database.delete_item', { namespace: 'mainsail', key })

            if (!(key in defaults)) continue

            await Vue.$socket.emitAndWait('server.database.post_item', {
                namespace: 'mainsail',
                key: key,
                value: defaults[key],
            })
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

                excludeKeys
                    .filter((excludeKey) => excludeKey.startsWith(key + '.'))
                    .forEach((excludeKey) => {
                        deletePath(backup[key], excludeKey.substring(key.length + 1))
                    })
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

    async restoreMoonrakerDB(_, payload) {
        const namespacesArray = await Vue.$socket
            .emitAndWait('server.database.list')
            .then((res) => res.namespaces ?? [])

        let mainsailArray: string[] = []
        if (namespacesArray.includes('mainsail')) {
            mainsailArray = await Vue.$socket
                .emitAndWait('server.database.get_item', { namespace: 'mainsail' })
                .then((res) => Object.keys(res.value ?? {}))
        }

        for (const key of payload.dbCheckboxes) {
            if (['timelapse', 'webcams'].includes(key)) {
                if (namespacesArray.includes(key)) {
                    const objects = await Vue.$socket.emitAndWait('server.database.get_item', { namespace: key })
                    for (const item of Object.keys(objects.value ?? {})) {
                        await Vue.$socket.emitAndWait('server.database.delete_item', { namespace: key, key: item })
                    }
                }

                for (const key2 of Object.keys(payload.restoreObjects[key])) {
                    const value = payload.restoreObjects[key][key2]
                    await Vue.$socket.emitAndWait('server.database.post_item', {
                        namespace: key,
                        key: key2,
                        value,
                    })
                }

                continue
            }

            if (mainsailArray.includes(key)) {
                await Vue.$socket.emitAndWait('server.database.delete_item', { namespace: 'mainsail', key })
            }

            await Vue.$socket.emitAndWait('server.database.post_item', {
                namespace: 'mainsail',
                key,
                value: payload.restoreObjects[key],
            })
        }

        window.location.reload()
    },

    saveExpandPanel({ dispatch, state }, payload: { name: string; viewport: GuiViewport; value: boolean }) {
        const array = [...state.dashboard.nonExpandPanels[payload.viewport]]
        const index = array.indexOf(payload.name)

        if (!payload.value && index === -1) array.push(payload.name)
        else if (payload.value && index !== -1) array.splice(index, 1)

        dispatch('saveSetting', {
            name: `dashboard.nonExpandPanels.${payload.viewport}`,
            value: array,
        })
    },

    resetLayout({ dispatch }, name: keyof GuiState['dashboard']) {
        const defaultState = getDefaultState()
        dispatch('saveSetting', {
            name: `dashboard.${name}`,
            value: defaultState.dashboard[name] ?? [],
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

    setChartData({ dispatch, state }, payload: { objectName: string; dataset: string; value: boolean | string }) {
        const value = { ...(state.view.tempchart.datasetSettings[payload.objectName] ?? {}) }
        value[payload.dataset] = payload.value

        dispatch('saveSetting', { name: `view.tempchart.datasetSettings.${payload.objectName}`, value })
    },

    setChartDataAdditionalSensorStatus(
        { dispatch, state },
        payload: { objectName: string; dataset: string; value: boolean }
    ) {
        const value = { ...(state.view.tempchart.datasetSettings[payload.objectName]?.additionalSensors ?? {}) }
        value[payload.dataset] = payload.value

        dispatch('saveSetting', {
            name: `view.tempchart.datasetSettings.${payload.objectName}.additionalSensors`,
            value,
        })
    },
}
