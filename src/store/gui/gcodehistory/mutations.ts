import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import Vue from 'vue'
import {GuiGcodehistoryState} from '@/store/gui/gcodehistory/types'

export const mutations: MutationTree<GuiGcodehistoryState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        Vue.set(state, 'history', payload.value?.history)
    },

    updateHistory(state, payload) {
        Vue.set(state, 'history', payload)
    },
}