import Vue from 'vue'
import { ActionTree } from 'vuex'
import { GuiState, GuiStateInitPayload, GuiViewport } from '@/store/gui/types'
import { RootState } from '@/store/types'
import { getDefaultState } from './index'
import { excludeKeys, themeDir } from '@/store/variables'
import { deletePath, isRecord } from '@/plugins/helpers'
import { JsonRpcError } from '@/types/moonraker'

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

        const values: GuiStateInitPayload = await (async () => {
            try {
                const payload = await Vue.$socket.emitAndWait('server.database.get_item', { namespace: 'mainsail' })
                return (payload?.value ?? {}) as GuiStateInitPayload
            } catch (e) {
                const code = (e as JsonRpcError).code || 0
                if (code !== -32601) {
                    const message = (e as JsonRpcError).message || 'Unknown error'
                    logError('Error while fetching mainsail namespace', message)
                    throw e
                }

                logDebug('create Mainsail namespace')
                const defaultValues = (await this.dispatch('gui/getDefaults')) as GuiStateInitPayload
                defaultValues.initVersion = rootGetters['getVersion']

                dispatch('restoreValues', defaultValues)
                return defaultValues
            }
        })()

        if ('remoteprinters' in values) {
            if (rootState.instancesDB === 'moonraker') {
                // TODO: convert to async module initialization
                dispatch('remoteprinters/initStore', values.remoteprinters?.printers ?? {})
            }
            delete values.remoteprinters
        }

        for (const key of excludeKeys) {
            const parts = key.split('.')
            let value: unknown = values

            for (const part of parts) {
                if (!isRecord(value)) break
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

        let defaults: Record<string, unknown> & { error?: { code?: number } } = {}
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
            const namespaceValue = values[key]
            if (!isRecord(namespaceValue)) continue

            for (const subKey of Object.keys(namespaceValue)) {
                await Vue.$socket.emitAndWait('server.database.post_item', {
                    namespace: key,
                    key: subKey,
                    value: namespaceValue[subKey],
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

    async resetMoonrakerDB(_, payload) {
        const defaults = await this.dispatch('gui/getDefaults')

        for (const key of payload) {
            if (['maintenance', 'timelapse', 'webcams'].includes(key)) {
                const objects = await Vue.$socket.emitAndWait('server.database.get_item', { namespace: key })

                if (objects?.value) {
                    for (const item of Object.keys(objects?.value)) {
                        await Vue.$socket.emitAndWait('server.database.delete_item', { namespace: key, key: item })
                    }
                }

                if (!(key in defaults)) continue

                for (const key2 of Object.keys(defaults[key])) {
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

    async backupMoonrakerDB(_, payload) {
        const backup: Record<string, Record<string, unknown>> = {}

        const mainsailDb = (await Vue.$socket
            .emitAndWait('server.database.get_item', { namespace: 'mainsail' })
            .then((res) => res.value ?? {})) as Record<string, unknown>

        for (const key of payload) {
            if (['timelapse', 'webcams'].includes(key)) {
                const result = await Vue.$socket.emitAndWait('server.database.get_item', { namespace: key })
                if (result?.value) backup[key] = { ...result.value }

                continue
            }

            const mainsailValue = mainsailDb[key]
            if (!isRecord(mainsailValue)) continue

            backup[key] = { ...mainsailValue }

            excludeKeys
                .filter((excludeKey) => excludeKey.startsWith(key + '.'))
                .forEach((excludeKey) => {
                    deletePath(backup[key], excludeKey.substring(key.length + 1))
                })
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
        const klipperCache = (state.gcodeViewer.klipperCache as Record<string, unknown>) ?? {}

        Object.keys(payload).forEach((key) => {
            const value = payload[key]
            const oldValue = key in klipperCache ? klipperCache[key] : null

            if (JSON.stringify(value) !== JSON.stringify(oldValue))
                dispatch('saveSetting', { name: `gcodeViewer.klipperCache.${key}`, value })
        })
    },

    setChartData({ dispatch, state }, payload: { objectName: string; dataset: string; value: boolean | string }) {
        const value: Record<string, unknown> = { ...(state.view.tempchart.datasetSettings[payload.objectName] ?? {}) }
        value[payload.dataset] = payload.value

        dispatch('saveSetting', { name: `view.tempchart.datasetSettings.${payload.objectName}`, value })
    },

    setChartDataAdditionalSensorStatus(
        { dispatch, state },
        payload: { objectName: string; dataset: string; value: boolean }
    ) {
        const value: Record<string, unknown> = {
            ...(state.view.tempchart.datasetSettings[payload.objectName]?.additionalSensors ?? {}),
        }
        value[payload.dataset] = payload.value

        dispatch('saveSetting', {
            name: `view.tempchart.datasetSettings.${payload.objectName}.additionalSensors`,
            value,
        })
    },
}
