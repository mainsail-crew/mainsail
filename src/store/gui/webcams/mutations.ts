import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiWebcamState, GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import Vue from 'vue'

export const mutations: MutationTree<GuiWebcamState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    setWebcams(state, webcams: GuiWebcamStateWebcam[]): void {
        Vue.set(state, 'webcams', webcams)
    },
}
