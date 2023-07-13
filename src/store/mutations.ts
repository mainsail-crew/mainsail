import Vue from 'vue'
import { MutationTree } from 'vuex'
import { RootState } from './types'

export const mutations: MutationTree<RootState> = {
    setNaviDrawer(state, payload) {
        Vue.set(state, 'naviDrawer', payload)
        localStorage.setItem('naviDrawer', payload)
    },

    setInstancesDB(state, payload) {
        Vue.set(state, 'instancesDB', payload)
    },

    setConfigInstances(state, payload) {
        Vue.set(state, 'configInstances', payload)
    },
}
