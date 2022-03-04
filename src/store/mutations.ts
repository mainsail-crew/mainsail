import Vue from 'vue'
import { MutationTree } from 'vuex'
import { RootState } from './types'

export const mutations: MutationTree<RootState> = {
    setNaviDrawer(state, payload) {
        Vue.set(state, 'naviDrawer', payload)
    },

    setRemoteMode(state, payload) {
        Vue.set(state, 'remoteMode', payload)
    },

    setConfigInstances(state, payload) {
        Vue.set(state, 'configInstances', payload)
    },
}
