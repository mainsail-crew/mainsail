import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerPowerState } from '@/store/server/power/types'

export const mutations: MutationTree<ServerPowerState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setDevices(state, payload) {
        Vue.set(state, 'devices', payload)
    },

    setStatus(state, payload) {
        const devIdx = state.devices.findIndex((device) => device.device === payload.device)
        if (devIdx >= 0) Vue.set(state.devices[devIdx], 'status', payload.status)
    },
}
