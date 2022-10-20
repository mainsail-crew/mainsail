import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerUpdateManagerState } from '@/store/server/updateManager/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<ServerUpdateManagerState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit('machine.update.status', {}, { action: 'server/updateManager/getStatus' })
    },

    async getStatus({ commit, dispatch }, payload) {
        await commit('setStatus', payload)
        await dispatch('socket/removeInitModule', 'server/updateManager/init', { root: true })
    },
}
