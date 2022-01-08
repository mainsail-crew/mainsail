import Vue from 'vue'
import {ActionTree} from 'vuex'
import {PrinterState} from '@/store/printer/types'
import {RootState} from '@/store/types'

export const actions: ActionTree<PrinterState, RootState> = {
    reset({ commit }) {
        commit('reset')
        commit('tempHistory/reset')
        commit('socket/clearLoadings', null, { root: true })
    },

    init() {
        window.console.debug('init printer')

        Vue.$socket.emit('printer.info', {}, { action: 'printer/getInfo' })
        Vue.$socket.emit('printer.objects.list', {}, { action: 'printer/initSubscripts' })
        Vue.$socket.emit('printer.gcode.help', {}, { action: 'printer/initHelpList' })
        Vue.$socket.emit('server.gcode_store', {}, { action: 'server/getGcodeStore' })
    },

    getInfo({ commit }, payload) {
        commit('server/setData', {
            klippy_state: payload.state,
            klippy_message: payload.state_message,
        }, { root: true })

        commit('setData', {
            hostname: payload.hostname,
            software_version: payload.software_version,
            cpu_info: payload.cpu_info,
        })
    },

    initSubscripts(_, payload) {
        let subscripts = {}
        const blocklist = [
            'menu',
        ]

        payload.objects.forEach((key: string) => {
            const nameSplit = key.split(' ')

            if (!blocklist.includes(nameSplit[0])) subscripts = {...subscripts, [key]: null }
        })

        if (subscripts !== {}) Vue.$socket.emit('printer.objects.subscribe', { objects: subscripts }, { action: 'printer/getInitData' })
        else Vue.$socket.emit('server.temperature_store', {}, { action: 'printer/tempHistory/init' })
    },

    getInitData({ dispatch }, payload) {
        dispatch('getData', payload)

        Vue.$socket.emit('server.temperature_store', {}, { action: 'printer/tempHistory/init' })
    },

    getData({ commit }, payload) {
        if ('status' in payload) payload = payload.status
        if ('requestParams' in payload) delete payload.requestParams

        const webhooks = Object.keys(payload).findIndex(element => element === 'webhooks')
        if (webhooks !== -1) {
            this.dispatch('server/getData', { klippy_state: payload['webhooks'].state, klippy_message: payload['webhooks'].state_message }, { root: true })
            delete payload.webhooks
        }

        commit('setData', payload)
    },

    initHelpList({ commit }, payload) {
        commit('setHelplist', payload)
    },

    getEndstopStatus({ commit }, payload) {
        commit('setEndstopStatus', payload)
    },

    removeBedMeshProfile({ commit }, payload) {
        commit('removeBedMeshProfile', payload)
    },

    sendGcode({ dispatch }, payload) {
        dispatch('server/addEvent', { message: payload, type: 'command' }, { root: true })

        if (payload.toLowerCase().trim() === 'm112') {
            Vue.$socket.emit('printer.emergency_stop', {}, { loading: 'sendGcode' })
        } else {
            Vue.$socket.emit('printer.gcode.script', { script: payload }, { loading: 'sendGcode' })
        }
    }
}