import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import Vue from 'vue'
import {GuiRemoteprintersState} from '@/store/gui/remoteprinters/types'

export const mutations: MutationTree<GuiRemoteprintersState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    store(state, payload) {
        Vue.set(state.remoteprinters, payload.id, payload.values)
    },

    update(state, payload) {
        if (payload.id in state.remoteprinters) {
            const preset = {...state.remoteprinters[payload.id]}
            Object.assign(preset, payload.values)

            Vue.set(state.remoteprinters, payload.id, preset)
        }
    },

    delete(state, payload) {
        if (payload in state.remoteprinters) {
            Vue.delete(state.remoteprinters, payload)
        }
    },
}