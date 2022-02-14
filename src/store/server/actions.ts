import Vue from 'vue'
import {ActionTree} from 'vuex'
import {ServerState, ServerStateEvent} from '@/store/server/types'
import {camelize, formatConsoleMessage} from '@/plugins/helpers'
import {RootState} from '@/store/types'
import {initableServerComponents} from '@/store/variables'

export const actions: ActionTree<ServerState, RootState> = {
    reset({ commit, dispatch }) {
        commit('reset')
        dispatch('power/reset')
        dispatch('updateManager/reset')
    },

    init() {
        window.console.debug('init Server')

        Vue.$socket.emit('server.info', {}, { action: 'server/initServerInfo'})
        Vue.$socket.emit('server.config', {}, { action: 'server/initServerConfig'})
        Vue.$socket.emit('machine.system_info', {}, { action: 'server/initSystemInfo'})
        Vue.$socket.emit('machine.proc_stats', {}, { action: 'server/initProcStats' })
        Vue.$socket.emit('server.database.list', { root: 'config' }, { action: 'server/checkDatabases'})
    },

    checkDatabases({ dispatch, commit, rootState }, payload) {
        if (payload.namespaces?.includes('mainsail')) dispatch('gui/init', null, { root: true })
        else dispatch('gui/initDb', null, { root: true })
        if (payload.namespaces?.includes('webcams')) dispatch('gui/webcams/init', null, { root: true })

        commit('saveDbNamespaces', payload.namespaces)

        Vue.$socket.emit('server.info', {}, { action: 'server/checkKlippyConnected'})
        //dispatch('printer/init', null, { root: true })
    },

    initServerInfo({ dispatch, commit }, payload) {
        // delete old plugin entries
        if ('plugins' in payload) delete payload.plugins
        if ('failed_plugins' in payload) delete payload.failed_plugins

        if (payload.components?.length) {
            payload.components.forEach((component: string) => {
                component = camelize(component)
                if (initableServerComponents.includes(component)) {
                    window.console.debug('init server component: '+component)
                    dispatch('server/' + component + '/init', {}, {root: true})
                }
            })
        }

        if (payload.registered_directories?.length) {
            dispatch('files/initRootDirs', payload.registered_directories, {root: true})
        }

        commit('setData', payload)
    },

    initServerConfig({ commit }, payload) {
        commit('setConfig', payload)
    },

    initSystemInfo({ commit }, payload) {
        commit('setSystemInfo', payload.system_info)
    },

    initProcStats({ commit }, payload) {
        if (payload.throttled_state !== null)
            commit('setThrottledState', payload.throttled_state)
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
                Vue.$socket.emit('server.info', {}, { action: 'server/checkKlippyConnected'})
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
                Vue.$socket.emit('printer.info', {}, { action: 'server/checkKlippyState'})
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

    checkKlippyState({ commit, dispatch, state }, payload: { state: string, state_message: string | null }) {
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

    getData({ commit }, payload){
        commit('setData', payload)
    },

    getGcodeStore({ commit, rootGetters }, payload) {
        commit('clearGcodeStore')

        let events: ServerStateEvent[] = payload.gcode_store
        const filters = rootGetters['gui/console/getConsolefilterRules']
        filters.forEach((filter: string) => {
            try {
                const regex = new RegExp(filter)
                events = events.filter(event => !regex.test(event.message))
            } catch { window.console.error('Custom console filter \''+filter+'\' doesn\'t work')}
        })

        commit('setGcodeStore', events)
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

        const filters = rootGetters['gui/console/getConsolefilterRules']
        let boolImport = true
        filters.every((filter: string) => {
            try {
                const regex = new RegExp(filter)
                if (regex.test(formatMessage)) boolImport = false
            } catch {
                window.console.error('Custom console filter \''+filter+'\' doesn\'t work')
            }

            return boolImport
        })

        if (boolImport) {
            if (payload.type === 'command') formatMessage = '<a class="command text--blue">'+formatMessage+'</a>'

            commit('addEvent', {
                date: new Date(),
                message: message,
                formatMessage: formatMessage,
                type: type
            })
        }
    },

    serviceStateChanged({ commit }, payload) {
        commit('updateServiceState', payload)
    }
}