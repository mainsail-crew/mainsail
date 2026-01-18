import Vue from 'vue'
import router from '@/plugins/router'
import { ActionTree } from 'vuex'
import { ServerState, ServerStateEvent } from '@/store/server/types'
import { camelize, convertName, formatConsoleMessage } from '@/plugins/helpers'
import { RootState } from '@/store/types'
import { initableServerComponents, maxEventHistory } from '@/store/variables'
import i18n from '@/plugins/i18n'
import type { JsonRpcError } from '@/types/moonraker'

const LOG_PREFIX = '[Server]'
const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

interface RawGcodeEvent {
    message: string
    type: string
    time?: number
}

function formatGcodeEvent(event: RawGcodeEvent): ServerStateEvent {
    let type = event.type
    if (type === 'response') {
        if (event.message.startsWith('// action:')) type = 'action'
        else if (event.message.startsWith('// debug:')) type = 'debug'
    }

    const formatted = formatConsoleMessage(event.message)
    const formatMessage = event.type === 'command' ? `<a class="command text--blue">${formatted}</a>` : formatted

    return {
        date: event.time ? new Date(event.time * 1000) : new Date(),
        message: event.message,
        formatMessage,
        type,
    }
}

export const actions: ActionTree<ServerState, RootState> = {
    reset({ commit, dispatch }) {
        dispatch('stopKlippyPolling')

        commit('reset')
        dispatch('power/reset')
        dispatch('updateManager/reset')
    },

    async init({ dispatch }) {
        logDebug('init')

        try {
            await dispatch('initIdentifyClient')
            const { components, registeredDirectories } = (await dispatch('initServerInfo')) as {
                components: string[]
                registeredDirectories: string[]
            }
            await dispatch('initServerConfig')
            await dispatch('initSystemInfo')
            await dispatch('initProcStats')
            const dbNamespaces = (await dispatch('initDatabases')) as string[]

            if (registeredDirectories.length) {
                // TODO: convert to async module initialization
                dispatch('files/initRootDirs', registeredDirectories, { root: true })
            }

            // TODO: convert to async module initialization
            if (dbNamespaces.includes('mainsail')) {
                dispatch('socket/addInitModule', 'gui/init', { root: true })
                dispatch('gui/init', null, { root: true })
            } else {
                dispatch('gui/initDb', null, { root: true })
            }

            // TODO: convert to async module initialization
            if (dbNamespaces.includes('maintenance')) {
                dispatch('socket/addInitModule', 'gui/maintenance/init', { root: true })
                dispatch('gui/maintenance/init', null, { root: true })
            } else {
                dispatch('gui/maintenance/initDb', null, { root: true })
            }

            // TODO: convert to async module initialization
            dispatch('socket/addInitModule', 'gui/webcam/init', { root: true })
            dispatch('gui/webcams/init', null, { root: true })

            await dispatch('initServerComponents', components)
            await dispatch('initGcodeStore')
            await dispatch('initKlippyConnection')

            dispatch('socket/setInitializationStep', null, { root: true })
        } catch (e) {
            const message = (e as JsonRpcError).message || 'Unknown error'
            if (message === 'Unauthorized') {
                dispatch('socket/setConnectionFailed', message, { root: true })
                return
            }

            logError('init failed:', message, e)
            dispatch('socket/setInitializationError', message, { root: true })
        }
    },

    async initIdentifyClient({ commit, dispatch, rootState }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.IdentifyingClient').toString(), {
            root: true,
        })

        const connection = await Vue.$socket.emitAndWait('server.connection.identify', {
            client_name: 'mainsail',
            version: rootState.packageVersion,
            type: 'web',
            url: 'https://github.com/mainsail-crew/mainsail',
        })
        commit('setConnectionId', connection.connection_id)
    },

    async initServerInfo({ commit, dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.LoadingServerInfo').toString(), {
            root: true,
        })

        const serverInfo = await Vue.$socket.emitAndWait('server.info')
        commit('setData', serverInfo)

        return {
            components: serverInfo.components ?? [],
            registeredDirectories: serverInfo.registered_directories ?? [],
        }
    },

    async initServerConfig({ commit, dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.LoadingServerConfig').toString(), {
            root: true,
        })

        const serverConfig = await Vue.$socket.emitAndWait('server.config')
        commit('setData', {
            config: serverConfig.config,
            config_orig: serverConfig.orig,
            config_files: serverConfig.files,
        })
    },

    async initSystemInfo({ commit, dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.LoadingSystemInfo').toString(), {
            root: true,
        })

        const systemInfo = await Vue.$socket.emitAndWait('machine.system_info')
        commit('setData', { system_info: systemInfo.system_info })
    },

    async initProcStats({ commit, dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.LoadingProcStats').toString(), {
            root: true,
        })

        const procStats = await Vue.$socket.emitAndWait('machine.proc_stats')

        commit('setThrottledState', procStats.throttled_state)
        if (procStats.system_uptime) {
            const system_boot_at = new Date(Date.now() - procStats.system_uptime * 1000)
            commit('setData', { system_boot_at })
        }
    },

    async initDatabases({ commit, dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.LoadingDatabase').toString(), {
            root: true,
        })

        const dbList = await Vue.$socket.emitAndWait('server.database.list', { root: 'config' })
        commit('setData', { dbNamespaces: dbList.namespaces })

        return dbList.namespaces || []
    },

    async initServerComponents({ dispatch }, serverComponents: string[]) {
        const componentsToInit = serverComponents.filter((component: string) =>
            initableServerComponents.includes(camelize(component))
        )
        const totalComponents = componentsToInit.length

        for (let i = 0; i < componentsToInit.length; i++) {
            const component = componentsToInit[i]
            logDebug('init component:', convertName(component))

            const progress = Math.round(((i + 1) / totalComponents) * 100)
            dispatch('socket/setInitializationProgress', progress, { root: true })
            dispatch(
                'socket/setInitializationStep',
                i18n.t('ConnectionDialog.InitSteps.LoadingComponent', { component: convertName(component) }).toString(),
                { root: true }
            )

            await dispatch('server/' + camelize(component) + '/init', {}, { root: true })
        }
    },

    async initGcodeStore({ commit, rootGetters }) {
        commit('clearGcodeStore')

        const { gcode_store } = await Vue.$socket.emitAndWait('server.gcode_store')
        const cleared_since = rootGetters['gui/console/getConsoleClearedSince']
        const filters = rootGetters['gui/console/getConsolefilterRules'] as string[]
        const regexFilters = filters
            .map((filter) => {
                try {
                    return new RegExp(filter)
                } catch {
                    logError('invalid console filter:', filter)
                    return null
                }
            })
            .filter((r): r is RegExp => r !== null)

        let events = gcode_store.filter((event: RawGcodeEvent) => {
            if (cleared_since && event.time && event.time * 1000 < cleared_since) return false
            return !regexFilters.some((regex) => regex.test(event.message))
        })

        if (events.length > maxEventHistory) {
            events = events.slice(-maxEventHistory)
        }

        commit('setGcodeStore', events.map(formatGcodeEvent))
    },

    async initKlippyConnection({ dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.CheckingKlipper').toString(), {
            root: true,
        })
        dispatch('socket/setInitializationProgress', null, { root: true })

        const isReady = await dispatch('checkAndUpdateKlippyState')
        if (!isReady) dispatch('startKlippyPolling')
    },

    async checkAndUpdateKlippyState({ commit, dispatch, rootState }): Promise<boolean> {
        const serverInfo = await Vue.$socket.emitAndWait('server.info')

        if (!serverInfo.klippy_connected) {
            commit('setKlippyState', 'disconnected')
            return false
        }

        commit('setKlippyConnected')

        const printerInfo = await Vue.$socket.emitAndWait('printer.info')
        commit('setKlippyState', printerInfo.state)
        commit('setKlippyMessage', printerInfo.state_message)

        if (printerInfo.state !== 'ready') {
            // just load commands, if no command is loaded yet. this is necessary to have autocomplete working in the
            // console right after the first load, but klippy is not ready yet
            const commands = rootState.printer?.gcode?.commands ?? {}
            if (Object.keys(commands).length === 0) {
                dispatch('printer/initGcodes', null, { root: true })
            }

            return false
        }

        dispatch('printer/init', null, { root: true })
        return true
    },

    updateProcStats({ commit }, payload) {
        if ('cpu_temp' in payload) commit('setCpuTemp', payload.cpu_temp)
        if ('moonraker_stats' in payload) commit('setMoonrakerStats', payload.moonraker_stats)
        if ('network' in payload) commit('setNetworkStats', payload.network)
        if ('system_cpu_usage' in payload) commit('setCpuStats', payload.system_cpu_usage)
    },

    setKlippyReady({ dispatch }) {
        dispatch('stopKlippyPolling')
        dispatch('printer/init', null, { root: true })
    },

    setKlippyDisconnected({ commit, dispatch }) {
        commit('setKlippyDisconnected')
        dispatch('startKlippyPolling')
    },

    setKlippyShutdown({ commit, dispatch }) {
        commit('setKlippyShutdown')
        dispatch('startKlippyPolling')
    },

    startKlippyPolling({ state, commit, dispatch }) {
        if (state.klippy_polling_timer) return

        const timer = window.setInterval(() => {
            dispatch('checkAndUpdateKlippyState')
        }, 1000)
        commit('setKlippyPollingTimer', timer)
    },

    stopKlippyPolling({ state, commit }) {
        if (!state.klippy_polling_timer) return

        clearInterval(state.klippy_polling_timer)
        commit('setKlippyPollingTimer', null)
    },

    addRootDirectory({ commit, state }, data) {
        if (state.registered_directories.includes(data.item.root)) return

        commit('addRootDirectory', { name: data.item.root })
    },

    addEvent({ commit, rootGetters }, payload) {
        const type = typeof payload === 'object' && 'type' in payload ? payload.type : 'response'
        let message: string
        if (typeof payload === 'string') {
            message = payload
        } else if ('message' in payload) {
            message = payload.message
        } else if ('result' in payload) {
            message = payload.result
        } else if ('error' in payload) {
            message = payload.error.message
        } else return

        const filters = rootGetters['gui/console/getConsolefilterRules'] as string[]
        const isFiltered = filters.some((filter) => {
            try {
                return new RegExp(filter).test(message)
            } catch {
                logError('invalid console filter:', filter)
                return false
            }
        })
        if (isFiltered) return

        const event = formatGcodeEvent({ message, type })
        commit('addEvent', event)

        const isErrorMessage = ['error', 'response'].includes(event.type) && message.startsWith('!! ')
        const isOnConsolePage = ['/', '/console'].includes(router.currentRoute.path)
        if (isErrorMessage && !isOnConsolePage) Vue.$toast.error(event.formatMessage)
    },

    serviceStateChanged({ commit }, payload) {
        commit('updateServiceState', payload)
    },

    addFailedInitComponent({ commit }, payload) {
        commit('removeComponent', payload)
        commit('addFailedInitComponent', payload)
    },
}
