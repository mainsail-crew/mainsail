import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiWebcamState } from '@/store/gui/webcams/types'
import Vue from 'vue'

export const mutations: MutationTree<GuiWebcamState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        Vue.set(state, 'webcams', payload)
    },
}
