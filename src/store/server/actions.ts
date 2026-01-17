import Vue from 'vue'
import router from '@/plugins/router'
import { ActionTree } from 'vuex'
import { ServerState, ServerStateEvent } from '@/store/server/types'
import { camelize, formatConsoleMessage } from '@/plugins/helpers'
import { RootState } from '@/store/types'
import { initableServerComponents } from '@/store/variables'
import i18n from '@/plugins/i18n'
import type { JsonRpcError } from '@/types/moonraker'

export const actions: ActionTree<ServerState, RootState> = {
    reset({ commit, dispatch }) {
        dispatch('stopKlippyPolling')

        commit('reset')
        dispatch('power/reset')
        dispatch('updateManager/reset')
    },

    async init({ dispatch }) {
        window.console.debug('init Server')

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
            await dispatch('initKlippyConnection')

            // Server init complete
            dispatch('socket/removeInitModule', 'server', { root: true })
            dispatch('socket/setInitializationStep', null, { root: true })
        } catch (e) {
            const message = (e as JsonRpcError).message || 'Unknown error'
            if (message === 'Unauthorized') {
                dispatch('socket/setConnectionFailed', message, { root: true })
                return
            }

            window.console.error(`Server init failed: ${message}`, e)
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

    // TODO: rework to async module initialization
    async initServerComponents({ dispatch }, serverComponents: string[]) {
        const componentsToInit = serverComponents.filter((component: string) =>
            initableServerComponents.includes(camelize(component))
        )
        const totalComponents = componentsToInit.length

        for (let i = 0; i < componentsToInit.length; i++) {
            const component = componentsToInit[i]
            const camelizedComponent = camelize(component)

            const progress = Math.round(((i + 1) / totalComponents) * 100)
            dispatch('socket/setInitializationProgress', progress, { root: true })
            dispatch(
                'socket/setInitializationStep',
                i18n.t('ConnectionDialog.InitSteps.LoadingComponent', { component: camelizedComponent }).toString(),
                { root: true }
            )

            window.console.debug('init server component: ' + camelizedComponent)
            dispatch('socket/addInitModule', 'server/' + camelizedComponent + '/init', { root: true })
            dispatch('server/' + camelizedComponent + '/init', {}, { root: true })
        }
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

    getData({ commit }, payload) {
        commit('setData', payload)
    },

    getGcodeStore({ commit, dispatch, rootGetters }, payload) {
        commit('clearGcodeStore')

        let events: ServerStateEvent[] = payload.gcode_store
        const filters = rootGetters['gui/console/getConsolefilterRules']
        filters.forEach((filter: string) => {
            try {
                const regex = new RegExp(filter)
                events = events.filter((event) => !regex.test(event.message))
            } catch {
                window.console.error("Custom console filter '" + filter + "' doesn't work")
            }
        })

        const cleared_since = rootGetters['gui/console/getConsoleClearedSince']

        events = events.filter((event) => {
            if (!cleared_since) {
                return true
            }

            if (event.time && event.time * 1000 < cleared_since) {
                return false
            }

            return !(event.date && new Date(event.date).valueOf() < cleared_since)
        })

        commit('setGcodeStore', events)
        dispatch('socket/removeInitModule', 'server/gcode_store', { root: true })
    },

    addRootDirectory({ commit, state }, data) {
        if (!state.registered_directories.includes(data.item.root)) {
            commit('addRootDirectory', { name: data.item.root })
        }
    },

    addEvent({ commit, rootGetters }, payload) {
        let message = payload
        let type = 'response'

        if (typeof payload === 'object' && 'type' in payload) type = payload.type

        if ('message' in payload) message = payload.message
        else if ('result' in payload) message = payload.result
        else if ('error' in payload) message = message.error.message

        let formatMessage = formatConsoleMessage(message)
        if (type === 'response') {
            if (message.startsWith('// action:')) type = 'action'
            else if (message.startsWith('// debug:')) type = 'debug'
        }

        const filters = rootGetters['gui/console/getConsolefilterRules']
        let boolImport = true
        filters.every((filter: string) => {
            try {
                const regex = new RegExp(filter)
                if (regex.test(formatMessage)) boolImport = false
            } catch {
                window.console.error("Custom console filter '" + filter + "' doesn't work!")
            }

            return boolImport
        })

        if (boolImport) {
            if (payload.type === 'command') formatMessage = '<a class="command text--blue">' + formatMessage + '</a>'

            commit('addEvent', {
                date: new Date(),
                message: message,
                formatMessage: formatMessage,
                type: type,
            })

            if (
                ['error', 'response'].includes(type) &&
                !['/', '/console'].includes(router.currentRoute.path) &&
                message.startsWith('!! ')
            ) {
                Vue.$toast.error(formatMessage)
            }
        }
    },

    serviceStateChanged({ commit }, payload) {
        commit('updateServiceState', payload)
    },

    addFailedInitComponent({ commit }, payload) {
        commit('removeComponent', payload)
        commit('addFailedInitComponent', payload)
    },
}
