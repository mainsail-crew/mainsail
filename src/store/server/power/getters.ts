import { GetterTree } from 'vuex'
import { ServerPowerState } from '@/store/server/power/types'

// eslint-disable-next-line
export const getters: GetterTree<ServerPowerState, any> = {
    getDevices: (state) => {
        return state.devices
    },
}
