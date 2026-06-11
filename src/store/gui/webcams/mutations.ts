import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiWebcamState } from '@/store/gui/webcams/types'

export const mutations: MutationTree<GuiWebcamState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        state.webcams = payload
    },
}
