import { Module } from 'vuex'
import { GuiHeightmapState } from './types'
import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'
import { RootState } from '@/store/types'

export const getDefaultState = (): GuiHeightmapState => {
    return {
        activecolorscheme: 'portland',
        defaultOrientation: 'rightFront',
    }
}

const state = getDefaultState()

export const heightmap: Module<GuiHeightmapState, RootState> = {
    namespaced: true,
    state,
    actions,
    getters,
    mutations,
}
