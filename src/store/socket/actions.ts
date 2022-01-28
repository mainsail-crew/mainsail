import Vue from 'vue'
import {ActionTree} from 'vuex'
import {SocketState} from '@/store/socket/types'
import {RootState} from '@/store/types'

export const actions: ActionTree<SocketState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    setData({ commit }, payload) {
        commit('setData', payload)
    },

    async setSocket({ commit, state }, payload) {
        commit('setData', payload)

        if ('$socket' in Vue.prototype) {
            await Vue.prototype.$socket.close()
            await Vue.prototype.$socket.setUrl(state.protocol+'://'+payload.hostname+':'+payload.port+'/websocket')
            await Vue.prototype.$socket.connect()
        }
    },

    onOpen ({ commit, dispatch, rootState }) {
        //set socket connection to connected
        commit('setConnected')

        // init server
        dispatch('server/init', null, { root: true })

        if (!rootState?.server?.updateManager?.updateResponse.complete)
            commit('server/updateManager/setStatus', { busy: false }, { root: true })
    },

    onClose ({ commit }) {
        commit('setDisconnected')
    },

    onMessage ({ commit, dispatch }, payload) {
        switch(payload.method) {
        case 'notify_status_update':
            commit('printer/setData', payload.params[0], { root: true })
            break

        case 'notify_gcode_response':
            dispatch('server/addEvent', Object.assign({ result: payload.params[0] }, { send: false }), { root: true })
            break

        case 'notify_klippy_ready':
            commit('server/setKlippyConnected', null, { root: true })
            dispatch('printer/reset', null, { root: true })
            dispatch('printer/init', null, { root: true })
            break

        case 'notify_klippy_disconnected':
            dispatch('server/setKlippyDisconnected', null, { root: true })
            break

        case 'notify_klippy_shutdown':
            dispatch('server/setKlippyShutdown', null, { root: true })
            break

        case 'notify_proc_stat_update':
            commit('server/setProcStats', payload.params[0], { root: true })
            break

        case 'notify_cpu_throttled':
            commit('server/setThrottledState', payload.params[0], { root: true })
            break

        case 'notify_filelist_changed':
            dispatch('files/filelist_changed', payload.params[0], { root: true })
            break

        case 'notify_metadata_update':
            commit('files/setMetadata', payload.params[0], { root: true })
            break

        case 'notify_power_changed':
            commit('server/power/setStatus', payload.params[0], { root: true })
            break

        case 'notify_update_response':
            commit('server/updateManager/addUpdateResponse', payload.params[0], { root: true })
            break

        case 'notify_update_refreshed':
            commit('server/updateManager/setStatus', payload.params[0], { root: true })
            break

        case 'notify_history_changed':
            dispatch('server/history/getChanged', payload.params[0], { root: true })
            break

        case 'notify_service_state_changed':
            dispatch('server/serviceStateChanged', payload.params[0], { root: true })
            break

        case 'notify_timelapse_event':
            dispatch('server/timelapse/getEvent', payload.params[0], { root: true })
            break

        case 'notify_job_queue_changed':
            dispatch('server/jobQueue/getEvent', payload.params[0], { root: true })
            break

        default:
            if (payload.result !== 'ok' && payload.error?.message) window.console.error('JSON-RPC: ' + payload.error.message)
            else window.console.debug(payload)
        }
    },

    addLoading({ commit }, payload: string) {
        commit('addLoading', payload)
    },

    removeLoading({ commit }, payload: string) {
        commit('removeLoading', payload)
    },

    clearLoadings({ commit }) {
        commit('clearLoadings')
    },

    reportDebug(_, payload) {
        window.console.log(payload)
    },
}