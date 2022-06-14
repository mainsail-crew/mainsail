import Vue from 'vue'
import router from '@/plugins/router'
import { ActionTree } from 'vuex'
import { ServerState, ServerStateEvent } from '@/store/server/types'
import { camelize, formatConsoleMessage } from '@/plugins/helpers'
import { RootState } from '@/store/types'
import { initableServerComponents } from '@/store/variables'

export const actions: ActionTree<ServerState, RootState> = {
    reset({ commit, dispatch }) {
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

        await dispatch('identify')
        await Vue.$socket.emit('server.info', {}, { action: 'server/initServerInfo' })
        await Vue.$socket.emit('server.config', {}, { action: 'server/initServerConfig' })
        await Vue.$socket.emit('machine.system_info', {}, { action: 'server/initSystemInfo' })
        await Vue.$socket.emit('machine.proc_stats', {}, { action: 'server/initProcStats' })
        await Vue.$socket.emit('server.database.list', { root: 'config' }, { action: 'server/checkDatabases' })

        await dispatch('socket/removeInitModule', 'server', { root: true })
    },

    async identify({ dispatch, rootState }) {
        await dispatch('socket/addInitModule', 'server/identify', { root: true })
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

    async setConnectionId({ commit, dispatch }, payload) {
        await commit('setConnectionId', payload.connection_id)
        await dispatch('socket/removeInitModule', 'server/identify', { root: true })
    },

    async checkDatabases({ dispatch, commit, rootState }, payload) {
        if (payload.namespaces?.includes('mainsail')) {
            await dispatch('socket/addInitModule', 'gui/init', { root: true })
            await dispatch('gui/init', null, { root: true })
        } else dispatch('gui/initDb', null, { root: true })
        if (payload.namespaces?.includes('webcams')) {
            await dispatch('socket/addInitModule', 'gui/webcam/init', { root: true })
            await dispatch('gui/webcams/init', null, { root: true })
        }

        await commit('saveDbNamespaces', payload.namespaces)

        await Vue.$socket.emit('server.info', {}, { action: 'server/checkKlippyConnected' })
        await dispatch('socket/removeInitModule', 'server/databaseList', { root: true })
    },

    async initServerInfo({ dispatch, commit }, payload) {
        // delete old plugin entries
        if ('plugins' in payload) delete payload.plugins
        if ('failed_plugins' in payload) delete payload.failed_plugins

        if (payload.components?.length) {
            for (let component of payload.components) {
                component = camelize(component)
                if (initableServerComponents.includes(component)) {
                    window.console.debug('init server component: ' + component)
                    await dispatch('socket/addInitModule', 'server/' + component + '/init', { root: true })
                    await dispatch('server/' + component + '/init', {}, { root: true })
                }
            }
        }

        if (payload.registered_directories?.length) {
            await dispatch('files/initRootDirs', payload.registered_directories, { root: true })
        }

        await commit('setData', payload)
        await dispatch('socket/removeInitModule', 'server/info', { root: true })
    },

    async initServerConfig({ commit, dispatch }, payload) {
        await commit('setConfig', payload)
        await dispatch('socket/removeInitModule', 'server/config', { root: true })
    },

    async initSystemInfo({ commit, dispatch }, payload) {
        await commit('setSystemInfo', payload.system_info)
        await dispatch('socket/removeInitModule', 'server/systemInfo', { root: true })
    },

    async initProcStats({ commit, dispatch }, payload) {
        if (payload.throttled_state !== null) commit('setThrottledState', payload.throttled_state)
        if (payload.system_uptime) {
            const system_boot_at = new Date(new Date().getTime() - payload.system_uptime * 1000)
            await commit('setSystemBootAt', system_boot_at)
        }

        await dispatch('socket/removeInitModule', 'server/procStats', { root: true })
    },

    updateProcStats({ commit }, payload) {
        if ('cpu_temp' in payload) commit('setCpuTemp', payload.cpu_temp)
        if ('moonraker_stats' in payload) commit('setMoonrakerStats', payload.moonraker_stats)
        if ('network' in payload) commit('setNetworkStats', payload.network)
        if ('system_cpu_usage' in payload) commit('setCpuStats', payload.system_cpu_usage)
    },

    setKlippyReady({ dispatch, state }) {
        if (state.klippy_connected_timer !== null) dispatch('stopKlippyConnectedInterval')
        if (state.klippy_state_timer !== null) dispatch('stopKlippyStateInterval')
        dispatch('printer/reset', null, { root: true })
        dispatch('printer/init', null, { root: true })
    },

    async setKlippyDisconnected({ commit, dispatch, state }) {
        await commit('setKlippyDisconnected', null)
        if (state.klippy_state_timer !== null) await dispatch('stopKlippyStateInterval')
        await dispatch('startKlippyConnectedInterval')
    },

    async setKlippyShutdown({ commit, dispatch, state }) {
        await commit('setKlippyShutdown', null)
        if (state.klippy_state_timer !== null) await dispatch('stopKlippyStateInterval')
        await dispatch('startKlippyConnectedInterval')
    },

    startKlippyConnectedInterval({ commit, state }) {
        if (state.klippy_connected_timer === null) {
            const timer = setInterval(() => {
                Vue.$socket.emit('server.info', {}, { action: 'server/checkKlippyConnected' })
            }, 2000)
            commit('setKlippyConnectedTimer', timer)
        }
    },

    stopKlippyConnectedInterval({ commit, state }) {
        if (state.klippy_connected_timer !== null) {
            clearInterval(state.klippy_connected_timer)
            commit('setKlippyConnectedTimer', null)
        }
    },

    async checkKlippyConnected({ commit, dispatch, state }, payload) {
        if (payload.klippy_connected) {
            await dispatch('stopKlippyConnectedInterval')
            await commit('setKlippyConnected')
            dispatch('checkKlippyState', { state: payload.klippy_state, state_message: null })
        } else if (!payload.klippy_connected && state.klippy_connected_timer === null)
            dispatch('startKlippyConnectedInterval')
    },

    startKlippyStateInterval({ commit, state }) {
        if (state.klippy_state_timer === null) {
            const timer = setInterval(() => {
                Vue.$socket.emit('printer.info', {}, { action: 'server/checkKlippyState' })
            }, 2000)
            commit('setKlippyStateTimer', timer)
        }
    },

    stopKlippyStateInterval({ commit, state }) {
        if (state.klippy_state_timer !== null) {
            clearInterval(state.klippy_state_timer)
            commit('setKlippyStateTimer', null)
        }
    },

    checkKlippyState({ commit, dispatch, state }, payload: { state: string; state_message: string | null }) {
        commit('setKlippyState', payload.state)
        commit('setKlippyMessage', payload.state_message)

        if (payload.state !== 'ready' && state.klippy_connected && state.klippy_state_timer === null) {
            dispatch('startKlippyStateInterval')
        } else if (payload.state === 'ready' && state.klippy_state_timer !== null) {
            dispatch('stopKlippyStateInterval')
        } else if (payload.state === 'ready' && state.klippy_state_timer === null) {
            dispatch('printer/init', null, { root: true })
        }
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

            if (event.date && new Date(event.date).valueOf() < cleared_since) {
                return false
            }

            return true
        })

        commit('setGcodeStore', events)
        dispatch('socket/removeInitModule', 'server/gcode_store', { root: true })
    },

    addRootDirectory({ commit, state }, data) {
        if (!state.registered_directories.includes(data.item.root)) {
            commit('addRootDirectory', { name: data.item.root })
        }
    },

    async addEvent({ commit, rootGetters }, payload) {
        let message = payload
        let type = 'response'

        if (typeof payload === 'object' && 'type' in payload) type = payload.type

        if ('message' in payload) message = payload.message
        else if ('result' in payload) message = payload.result
        else if ('error' in payload) message = message.error.message

        let formatMessage = formatConsoleMessage(message)

        const filters = rootGetters['gui/console/getConsolefilterRules']
        let boolImport = true
        filters.every((filter: string) => {
            try {
                const regex = new RegExp(filter)
                if (regex.test(formatMessage)) boolImport = false
            } catch {
                window.console.error("Custom console filter '" + filter + "' doesn't work")
            }

            return boolImport
        })

        if (boolImport) {
            if (payload.type === 'command') formatMessage = '<a class="command text--blue">' + formatMessage + '</a>'

            await commit('addEvent', {
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
}
