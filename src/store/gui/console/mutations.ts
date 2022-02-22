import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import { GuiConsoleState } from '@/store/gui/console/types'

export const mutations: MutationTree<GuiConsoleState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    clear(state, payload) {
        Vue.set(state, 'cleared_since', payload.cleared_since)
    },

    filterStore(state, payload) {
        Vue.set(state.consolefilters, payload.id, payload.values)
    },

    filterUpdate(state, payload) {
        if (payload.id in state.consolefilters) {
            const preset = { ...state.consolefilters[payload.id] }
            Object.assign(preset, payload.values)

            Vue.set(state.consolefilters, payload.id, preset)
        }
    },

    filterDelete(state, payload) {
        if (payload in state.consolefilters) {
            Vue.delete(state.consolefilters, payload)
        }
    },
}
