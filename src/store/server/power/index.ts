import { Module } from 'vuex'
import { ServerPowerState } from '@/store/server/power/types'
import { actions } from '@/store/server/power/actions'
import { mutations } from '@/store/server/power/mutations'
import { getters } from '@/store/server/power/getters'
import { RootState } from '@/store/types'

export const getDefaultState = (): ServerPowerState => {
    return {
        devices: [],
    }
}

// initial state
const state = getDefaultState()

export const power: Module<ServerPowerState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
