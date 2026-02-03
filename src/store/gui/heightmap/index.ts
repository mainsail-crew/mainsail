import { Module } from 'vuex'
import { GuiHeightmapState } from './types'
import { getters } from './getters'
import { actions } from './actions'

export const getDefaultState = (): GuiHeightmapState => {
    return {
        activecolorscheme: 'portland',
        defaultOrientation: 'rightFront',
    }
}

const state = getDefaultState()

export const heightmap: Module<GuiHeightmapState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
}
