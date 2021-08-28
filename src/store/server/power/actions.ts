import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerPowerState } from '@/store/server/power/types'
import {RootState} from '@/store/types'

export const actions: ActionTree<ServerPowerState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit('machine.device_power.devices', {}, { action: 'server/power/getDevices'})
    },

    getDevices({ commit }, payload) {
        if (!payload.error) commit('setDevices', payload.devices)
    },

    getStatus({ commit }, payload) {
        if (!payload.error)
            commit('setStatus', payload)
    },

    responseToggle({ commit }, payload) {
        if ('requestParams' in payload) delete payload.requestParams

        for (const [key, value] of Object.entries(payload)) {
            commit('setStatus', { device: key, status: value })
        }
    }
}