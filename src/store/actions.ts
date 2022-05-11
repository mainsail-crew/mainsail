import router from '@/plugins/router'
import { ActionTree } from 'vuex'
import { ConfigJson, RootState } from './types'
import { v4 as uuidv4 } from 'uuid'

export const actions: ActionTree<RootState, RootState> = {
    switchToDashboard() {
        if (router.currentRoute.fullPath !== '/') router.push('/')
    },

    changePrinter({ dispatch, getters, state }, payload) {
        const remoteMode = state.remoteMode

        dispatch('files/reset')
        dispatch('gui/reset')
        dispatch('printer/reset')
        dispatch('server/reset')
        dispatch('socket/reset')

        const printerSocket = getters['farm/' + payload.printer + '/getSocketData']

        dispatch('socket/setSocket', {
            hostname: printerSocket.hostname,
            port: printerSocket.port,
        })
    },

    setNaviDrawer({ commit }, payload) {
        commit('setNaviDrawer', payload)
    },

    /**
     * This function will parse the config.json content and config mainsail
     * @param commit - vuex commit
     * @param dispatch - vuex dispatch
     * @param payload - content of config.json as a object
     */
    importConfigJson({ commit, dispatch }, payload: ConfigJson) {
        const remoteMode = 'remoteMode' in payload ? payload.remoteMode : false
        if (remoteMode) {
            commit('setRemoteMode', true)

            if ('instances' in payload && Array.isArray(payload.instances) && payload.instances.length) {
                commit('setConfigInstances', payload.instances)
            }
        }
    },
}
