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

    checkDatabases({ dispatch, rootState }, payload) {
        if (payload.namespaces?.includes('mainsail')) dispatch('gui/init', null, { root: true })
        if (payload.namespaces?.includes('webcams')) dispatch('gui/webcams/init', null, { root: true })
        if (payload.namespaces?.includes('mainsail_presets')) dispatch('gui/presets/init', null, { root: true })
        if (payload.namespaces?.includes('mainsail_consolefilters')) dispatch('gui/consolefilters/init', null, { root: true })
        if (payload.namespaces?.includes('mainsail_macrogroups')) dispatch('gui/macrogroups/init', null, { root: true })
        if (!rootState.socket?.remoteMode && payload.namespaces?.includes('mainsail_remoteprinters')) dispatch('gui/remoteprinters/init', null, { root: true })

        dispatch('printer/init', null, { root: true })
    },

    initServerInfo: function ({ dispatch, commit }, payload) {
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

    setKlippyReady({ dispatch }) {
        dispatch('printer/reset', null, { root: true })
        dispatch('printer/init', null, { root: true })
    },

    getData({ commit }, payload){
        commit('setData', payload)
    },

    getGcodeStore({ commit, rootGetters }, payload) {
        commit('clearGcodeStore')

        let events: ServerStateEvent[] = payload.gcode_store
        const filters = rootGetters['gui/consolefilters/getConsolefilterRules']
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

        const filters = rootGetters['gui/consolefilters/getConsolefilterRules']
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