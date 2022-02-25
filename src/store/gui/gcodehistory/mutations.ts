import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import { GuiGcodehistoryState } from '@/store/gui/gcodehistory/types'

export const mutations: MutationTree<GuiGcodehistoryState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    updateHistory(state, payload) {
        Vue.set(state, 'entries', payload)
    },
}
