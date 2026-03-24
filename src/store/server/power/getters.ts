import { GetterTree } from 'vuex'
import { ServerPowerState } from '@/store/server/power/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<ServerPowerState, RootState> = {
    getDevices: (state) => {
        return state.devices
    },
}
