import { Module } from 'vuex'
import { ServerPowerState } from '@/store/server/power/types'
import { actions } from '@/store/server/power/actions'
import { mutations } from '@/store/server/power/mutations'
import { getters } from '@/store/server/power/getters'

export const getDefaultState = (): ServerPowerState => {
    return {
        devices: [],
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const power: Module<ServerPowerState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
