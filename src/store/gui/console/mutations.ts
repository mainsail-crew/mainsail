import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import { GuiConsoleState } from '@/store/gui/console/types'

export const mutations: MutationTree<GuiConsoleState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    filterDelete(state, payload) {
        if (!(payload in state.consolefilters)) return

        Vue.delete(state.consolefilters, payload)
    },
}
