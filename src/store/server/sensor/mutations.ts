import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerSensorState } from '@/store/server/sensor/types'

export const mutations: MutationTree<ServerSensorState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setSensors(state, payload) {
        state.sensors = payload
    },

    updateSensor(state, payload) {
        if (!(payload.key in state.sensors)) return

        state.sensors[payload.key].values = payload.value
    },
}
