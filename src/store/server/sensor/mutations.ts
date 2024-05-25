import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerSensorState } from '@/store/server/sensor/types'

export const mutations: MutationTree<ServerSensorState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setSensors(state, payload) {
        Vue.set(state, 'sensors', payload)
    },

    updateSensor(state, payload) {
        Vue.set(state.sensors, payload.key, payload.value)
    },
}
