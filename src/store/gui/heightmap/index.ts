import { Module } from 'vuex'
import { HeightmapState } from './types'
import { getters } from './getters'
import { actions } from './actions'
import { RootState } from '@/store/types'

export const getDefaultState = (): HeightmapState => {
    return {
        activecolorscheme: 'portland',
        defaultOrientation: 'rightFront',
    }
}

const state = getDefaultState()

export const heightmap: Module<HeightmapState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
}
