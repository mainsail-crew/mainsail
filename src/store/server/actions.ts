import Vue from 'vue'
import router from '@/plugins/router'
import { ActionTree } from 'vuex'
import { MoonrakerApiIdentifyResponse, ServerState, ServerStateEvent } from '@/store/server/types'
import { camelize, formatConsoleMessage } from '@/plugins/helpers'
import { RootState } from '@/store/types'
import { initableServerComponents } from '@/store/variables'
import i18n from '@/plugins/i18n'

export const actions: ActionTree<ServerState, RootState> = {
    reset({ commit, dispatch }) {
        dispatch('stopKlippyConnectedInterval')
        dispatch('stopKlippyStateInterval')

        commit('reset')
        dispatch('power/reset')
        dispatch('updateManager/reset')
    },

    async init({ dispatch }) {
        window.console.debug('init Server')

        try {
            await dispatch('initIdentifyClient')
            const serverComponents = await dispatch('initServerInfo')
            await dispatch('initServerConfig')
            await dispatch('initSystemInfo')
            await dispatch('initProcStats')
            await dispatch('initDatabases')
            await dispatch('initServerComponents', serverComponents)
            await dispatch('initKlippyConnection')

            // Server init complete
            dispatch('socket/removeInitModule', 'server', { root: true })
            dispatch('socket/setInitializationStep', null, { root: true })
        } catch (e: any) {
            window.console.error('Server init failed:', e)

            if (e?.message === 'Unauthorized') {
                dispatch('socket/setConnectionFailed', 'Unauthorized', { root: true })
            } else {
                dispatch('socket/setInitializationError', e?.message ?? 'Unknown error', { root: true })
            }
        }
    },

    async initIdentifyClient({ commit, dispatch, rootState }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.IdentifyingClient').toString(), {
            root: true,
        })

        try {
            const connection = await Vue.$socket.emitAndWait<MoonrakerApiIdentifyResponse>(
                'server.connection.identify',
                {
                    client_name: 'mainsail',
                    version: rootState.packageVersion,
                    type: 'web',
                    url: 'https://github.com/mainsail-crew/mainsail',
                }
            )
            commit('setConnectionId', connection.connection_id)
        } catch (e: any) {
            if (e?.message === 'Unauthorized') {
                dispatch('socket/setConnectionFailed', 'Unauthorized', { root: true })
            } else {
                dispatch('socket/setInitializationError', e?.message ?? 'Unknown error', { root: true })
            }
        }
    },

    async initServerInfo({ commit, dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.LoadingServerInfo').toString(), {
            root: true,
        })

        const serverInfo = await Vue.$socket.emitAndWait('server.info')

        if ('plugins' in serverInfo) delete serverInfo.plugins
        if ('failed_plugins' in serverInfo) delete serverInfo.failed_plugins

        if (serverInfo.registered_directories?.length) {
            dispatch('files/initRootDirs', serverInfo.registered_directories, { root: true })
        }

        commit('setData', serverInfo)

        return serverInfo.components ?? []
    },

    async initServerConfig({ commit, dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.LoadingServerConfig').toString(), {
            root: true,
        })

        const serverConfig = await Vue.$socket.emitAndWait('server.config')
        commit('setConfig', serverConfig)
    },

    async initSystemInfo({ commit, dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.LoadingSystemInfo').toString(), {
            root: true,
        })

        const systemInfo = await Vue.$socket.emitAndWait('machine.system_info')
        commit('setSystemInfo', systemInfo.system_info)
    },

    async initProcStats({ commit, dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.LoadingProcStats').toString(), {
            root: true,
        })

        const procStats = await Vue.$socket.emitAndWait('machine.proc_stats')

        if (procStats.throttled_state !== null) {
            commit('setThrottledState', procStats.throttled_state)
        }
        if (procStats.system_uptime) {
            const system_boot_at = new Date(Date.now() - procStats.system_uptime * 1000)
            commit('setSystemBootAt', system_boot_at)
        }
    },

    async initDatabases({ commit, dispatch }) {
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitSteps.LoadingDatabase').toString(), {
            root: true,
        })

        const dbList = await Vue.$socket.emitAndWait('server.database.list', { root: 'config' })

        if (dbList.namespaces?.includes('mainsail')) {
            dispatch('socket/addInitModule', 'gui/init', { root: true })
            dispatch('gui/init', null, { root: true })
        } else {
            dispatch('gui/initDb', null, { root: true })
        }

        if (dbList.namespaces?.includes('maintenance')) {
            dispatch('socket/addInitModule', 'gui/maintenance/init', { root: true })
            dispatch('gui/maintenance/init', null, { root: true })
        } else {
            dispatch('gui/maintenance/initDb', null, { root: true })
        }

        dispatch('socket/addInitModule', 'gui/webcam/init', { root: true })
        dispatch('gui/webcams/init', null, { root: true })

        commit('saveDbNamespaces', dbList.namespaces)
    },

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

        const klippyStatus = await Vue.$socket.emitAndWait('server.info')
        dispatch('checkKlippyConnected', {
            klippy_connected: klippyStatus.klippy_connected,
            klippy_state: klippyStatus.klippy_state,
        })
    },

    updateProcStats({ commit }, payload) {
        if ('cpu_temp' in payload) commit('setCpuTemp', payload.cpu_temp)
        if ('moonraker_stats' in payload) commit('setMoonrakerStats', payload.moonraker_stats)
        if ('network' in payload) commit('setNetworkStats', payload.network)
        if ('system_cpu_usage' in payload) commit('setCpuStats', payload.system_cpu_usage)
    },

    setKlippyReady({ dispatch }) {
        dispatch('stopKlippyConnectedInterval')
        dispatch('stopKlippyStateInterval')
        dispatch('printer/reset', null, { root: true })
        dispatch('printer/init', null, { root: true })
    },

    setKlippyDisconnected({ commit, dispatch }) {
        commit('setKlippyDisconnected', null)
        dispatch('stopKlippyStateInterval')
        dispatch('startKlippyConnectedInterval')
    },

    setKlippyShutdown({ commit, dispatch }) {
        commit('setKlippyShutdown', null)
        dispatch('stopKlippyStateInterval')
        dispatch('startKlippyConnectedInterval')
    },

    startKlippyConnectedInterval({ commit, state }) {
        if (state.klippy_connected_timer) return

        const timer = setInterval(() => {
            Vue.$socket.emit('server.info', {}, { action: 'server/checkKlippyConnected' })
        }, 2000)
        commit('setKlippyConnectedTimer', timer)
    },

    stopKlippyConnectedInterval({ commit, state }) {
        if (state.klippy_connected_timer === null) return

        clearInterval(state.klippy_connected_timer)
        commit('setKlippyConnectedTimer', null)
    },

    checkKlippyConnected({ commit, dispatch }, payload) {
        if (!payload.klippy_connected) {
            dispatch('startKlippyConnectedInterval')

            return
        }

        dispatch('stopKlippyConnectedInterval')
        commit('setKlippyConnected')
        dispatch('printer/initGcodes', null, { root: true })
        dispatch('checkKlippyState', { state: payload.klippy_state, state_message: null })
    },

    startKlippyStateInterval({ commit, state }) {
        if (state.klippy_state_timer) return

        const timer = setInterval(() => {
            Vue.$socket.emit('printer.info', {}, { action: 'server/checkKlippyState' })
        }, 2000)
        commit('setKlippyStateTimer', timer)
    },

    stopKlippyStateInterval({ commit, state }) {
        if (state.klippy_state_timer === null) return

        clearInterval(state.klippy_state_timer)
        commit('setKlippyStateTimer', null)
    },

    checkKlippyState({ commit, dispatch }, payload: { state: string; state_message: string | null }) {
        commit('setKlippyState', payload.state)
        commit('setKlippyMessage', payload.state_message)

        if (payload.state !== 'ready') {
            dispatch('startKlippyStateInterval')
            return
        }

        dispatch('stopKlippyConnectedInterval')
        dispatch('stopKlippyStateInterval')
        dispatch('printer/init', null, { root: true })
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
