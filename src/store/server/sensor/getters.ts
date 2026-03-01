import { GetterTree } from 'vuex'
import { ServerSensorState } from '@/store/server/sensor/types'

export const getters: GetterTree<ServerSensorState, any> = {
    getSensors: (state) => {
        return Object.keys(state.sensors)
    },
}
