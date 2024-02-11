import { Module } from 'vuex'
import { HeightmapState } from './types'
import { getters } from './getters'
import { actions } from './actions'

export const getDefaultState = (): HeightmapState => {
    return {
        activecolorscheme: 'portland',
    }
}

const state = getDefaultState()

export const heightmap: Module<HeightmapState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
}
