import { GetterTree } from 'vuex'
import { ServerSensorState } from '@/store/server/sensor/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<ServerSensorState, RootState> = {
    getSensors: (state) => {
        return Object.keys(state.sensors)
    },
}
