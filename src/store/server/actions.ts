import Vue from 'vue'
import router from '@/plugins/router'
import { ActionTree } from 'vuex'
import { ServerState, ServerStateEvent } from '@/store/server/types'
import { camelize, formatConsoleMessage } from '@/plugins/helpers'
import { RootState } from '@/store/types'
import { initableServerComponents } from '@/store/variables'

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

        dispatch('socket/addInitModule', 'server/info', { root: true })
        dispatch('socket/addInitModule', 'server/config', { root: true })
        dispatch('socket/addInitModule', 'server/systemInfo', { root: true })
        dispatch('socket/addInitModule', 'server/procStats', { root: true })
        dispatch('socket/addInitModule', 'server/databaseList', { root: true })

        dispatch('identify')
        Vue.$socket.emit('server.info', {}, { action: 'server/initServerInfo' })
        Vue.$socket.emit('server.config', {}, { action: 'server/initServerConfig' })
        Vue.$socket.emit('machine.system_info', {}, { action: 'server/initSystemInfo' })
        Vue.$socket.emit('machine.proc_stats', {}, { action: 'server/initProcStats' })
        Vue.$socket.emit('server.database.list', { root: 'config' }, { action: 'server/checkDatabases' })

        await dispatch('socket/removeInitModule', 'server', { root: true })
    },

    identify({ dispatch, rootState }): void {
        dispatch('socket/addInitModule', 'server/identify', { root: true })
        Vue.$socket.emit(
            'server.connection.identify',
            {
                client_name: 'mainsail',
                version: rootState.packageVersion,
                type: 'web',
                url: 'https://github.com/mainsail-crew/mainsail',
            },
            { action: 'server/setConnectionId' }
        )
    },

    setConnectionId({ commit, dispatch }, payload) {
        commit('setConnectionId', payload.connection_id)
        dispatch('socket/removeInitModule', 'server/identify', { root: true })
    },

    checkDatabases({ dispatch, commit }, payload) {
        if (payload.namespaces?.includes('mainsail')) {
            dispatch('socket/addInitModule', 'gui/init', { root: true })
            dispatch('gui/init', null, { root: true })
        } else dispatch('gui/initDb', null, { root: true })
        if (payload.namespaces?.includes('webcams')) {
            dispatch('socket/addInitModule', 'gui/webcam/init', { root: true })
            dispatch('gui/webcams/init', null, { root: true })
        }

        commit('saveDbNamespaces', payload.namespaces)

        Vue.$socket.emit('server.info', {}, { action: 'server/checkKlippyConnected' })
        dispatch('socket/removeInitModule', 'server/databaseList', { root: true })
    },

    initServerInfo({ dispatch, commit }, payload) {
        // delete old plugin entries
        if ('plugins' in payload) delete payload.plugins
        if ('failed_plugins' in payload) delete payload.failed_plugins

        if (payload.components?.length) {
            for (let component of payload.components) {
                component = camelize(component)
                if (initableServerComponents.includes(component)) {
                    window.console.debug('init server component: ' + component)
                    dispatch('socket/addInitModule', 'server/' + component + '/init', { root: true })
                    dispatch('server/' + component + '/init', {}, { root: true })
                }
            }
        }

        if (payload.registered_directories?.length) {
            dispatch('files/initRootDirs', payload.registered_directories, { root: true })
        }

        commit('setData', payload)
        dispatch('socket/removeInitModule', 'server/info', { root: true })
    },

    initServerConfig({ commit, dispatch }, payload) {
        commit('setConfig', payload)
        dispatch('socket/removeInitModule', 'server/config', { root: true })
    },

    initSystemInfo({ commit, dispatch }, payload) {
        commit('setSystemInfo', payload.system_info)
        dispatch('socket/removeInitModule', 'server/systemInfo', { root: true })
    },

    initProcStats({ commit, dispatch }, payload) {
        if (payload.throttled_state !== null) {
            commit('setThrottledState', payload.throttled_state)
        }

        if (payload.system_uptime) {
            const system_boot_at = new Date(new Date().getTime() - payload.system_uptime * 1000)
            commit('setSystemBootAt', system_boot_at)
        }

        dispatch('socket/removeInitModule', 'server/procStats', { root: true })
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
        if (type === 'response' && message.startsWith('// action:')) type = 'action'

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
