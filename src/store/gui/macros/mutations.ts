import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import { GuiMacrosState } from '@/store/gui/macros/types'

export const mutations: MutationTree<GuiMacrosState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    groupDelete(state, id: string): void {
        if (!(id in state.macrogroups)) return

        Vue.delete(state.macrogroups, id)
    },
}
