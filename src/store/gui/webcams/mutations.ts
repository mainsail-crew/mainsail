import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import {GuiWebcamState} from '@/store/gui/webcams/types'
import Vue from 'vue'

export const mutations: MutationTree<GuiWebcamState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        Vue.set(state, 'webcams', payload.value)
    },

    store(state, payload) {
        Vue.set(state.webcams, payload.id, payload.values)
    },

    update(state, payload) {
        if (payload.id in state.webcams) {
            const webcam = {...state.webcams[payload.id]}
            Object.assign(webcam, payload.values)

            Vue.set(state.webcams, payload.id, webcam)
        }
    },

    delete(state, payload) {
        if (payload in state.webcams) {
            Vue.delete(state.webcams, payload)
        }
    },
}