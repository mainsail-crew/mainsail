import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiHeightmapState } from './types'

export const mutations: MutationTree<GuiHeightmapState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },
}
