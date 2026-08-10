import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import { GuiPresetsState } from '@/store/gui/presets/types'

export const mutations: MutationTree<GuiPresetsState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    delete(state, presetId: string): void {
        if (!(presetId in state.presets)) return

        Vue.delete(state.presets, presetId)
    },
}
