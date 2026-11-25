import { Module } from 'vuex'
import { FarmState } from '@/store/farm/types'
import { RootState } from '@/store/types'
import { actions } from '@/store/farm/actions'
import { getters } from '@/store/farm/getters'

export const getDefaultState = (): FarmState => {
    return {}
}

// initial state
const state = () => {
    return getDefaultState()
}

export const farm: Module<FarmState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations: {},
}
