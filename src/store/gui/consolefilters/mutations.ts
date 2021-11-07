import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import Vue from 'vue'
import {GuiConsolefiltersState} from '@/store/gui/consolefilters/types'

export const mutations: MutationTree<GuiConsolefiltersState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        Vue.set(state, 'consolefilters', payload.value)
    },

    store(state, payload) {
        Vue.set(state.consolefilters, payload.id, payload.values)
    },

    update(state, payload) {
        if (payload.id in state.consolefilters) {
            const preset = {...state.consolefilters[payload.id]}
            Object.assign(preset, payload.values)

            Vue.set(state.consolefilters, payload.id, preset)
        }
    },

    delete(state, payload) {
        if (payload in state.consolefilters) {
            Vue.delete(state.consolefilters, payload)
        }
    },
}