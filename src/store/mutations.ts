import Vue from 'vue'
import { MutationTree } from 'vuex'
import { RootState } from './types'

export const mutations: MutationTree<RootState> = {
    setNaviDrawer(state, payload) {
        Vue.set(state, 'naviDrawer', payload)
    },
}
