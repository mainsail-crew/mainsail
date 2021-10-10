import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerUpdateMangerState } from '@/store/server/updateManager/types'
import {RootState} from '@/store/types'

export const actions: ActionTree<ServerUpdateMangerState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit('machine.update.status', {}, { action: 'server/updateManager/getStatus'})
    },

    getStatus({ commit }, payload) {
        commit('setStatus', payload)
    },
}