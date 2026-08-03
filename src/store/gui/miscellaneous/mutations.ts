import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import { GuiMiscellaneousState } from '@/store/gui/miscellaneous/types'

export const mutations: MutationTree<GuiMiscellaneousState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    destroyLightgroup(state, payload: { id: string; lightgroupId: string }): void {
        const entry = state.entries[payload.id]
        if (!entry) return

        Vue.delete(entry.lightgroups, payload.lightgroupId)
    },

    destroyPreset(state, payload: { id: string; presetId: string }): void {
        const entry = state.entries[payload.id]
        if (!entry) return

        Vue.delete(entry.presets, payload.presetId)
    },
}
