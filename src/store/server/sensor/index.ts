import { Module } from 'vuex'
import { ServerSensorState } from '@/store/server/sensor/types'
import { actions } from '@/store/server/sensor/actions'
import { mutations } from '@/store/server/sensor/mutations'
import { getters } from '@/store/server/sensor/getters'

export const getDefaultState = (): ServerSensorState => {
    return {
        sensors: {},
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const sensor: Module<ServerSensorState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
