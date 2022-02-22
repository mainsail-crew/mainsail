import router from '@/plugins/router'
import { ActionTree } from 'vuex'
import { RootState } from './types'
import Vue from 'vue'

export const actions: ActionTree<RootState, RootState> = {
    switchToDashboard() {
        router.push('/')
    },

    changePrinter({ dispatch, getters, state }, payload) {
        const remoteMode = state.socket?.remoteMode

        dispatch('files/reset')
        dispatch('gui/reset')
        dispatch('printer/reset')
        dispatch('server/reset')
        dispatch('socket/reset')

        const printerSocket = getters['farm/' + payload.printer + '/getSocketData']

        dispatch('socket/setSocket', {
            hostname: printerSocket.hostname,
            port: printerSocket.port,
            remoteMode: remoteMode,
        })
    },

    setNaviDrawer({ commit }, payload) {
        commit('setNaviDrawer', payload)
    },
}
