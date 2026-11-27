import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GcodeviewerState } from '@/store/gcodeviewer/types'
import Vue from 'vue'

export const mutations: MutationTree<GcodeviewerState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    setValue<K extends keyof GcodeviewerState>(
        state: GcodeviewerState,
        payload: { key: K; value: GcodeviewerState[K] }
    ): void {
        Vue.set(state, payload.key, payload.value)
    },
}
