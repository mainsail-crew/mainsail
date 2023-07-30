import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerTimelapseState } from '@/store/server/timelapse/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<ServerTimelapseState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit('machine.timelapse.get_settings', {}, { action: 'server/timelapse/initSettings' })
        Vue.$socket.emit('machine.timelapse.lastframeinfo', {}, { action: 'server/timelapse/initLastFrameinfo' })
    },

    async initSettings({ commit, dispatch }, payload) {
        if ('requestParams' in payload) delete payload.requestParams

        await commit('setSettings', payload)
        await dispatch('socket/removeInitModule', 'server/timelapse/init', { root: true })
    },

    initLastFrameinfo({ commit }, payload) {
        commit('setLastFrame', {
            count: payload.framecount,
            file: payload.lastframefile,
        })
    },

    getEvent({ commit }, payload) {
        switch (payload.action) {
            case 'newframe':
                commit('setLastFrame', {
                    count: parseInt(payload.frame),
                    file: payload.framefile,
                })
                break

            case 'render':
                if (payload.status === 'error') {
                    Vue.$toast.error(payload.msg)
                    commit('resetSnackbar')
                } else commit('setRenderStatus', payload)
                break

            default:
                window.console.log('unknown timelapse event', payload)
        }
    },

    saveSetting(_, payload) {
        Vue.$socket.emit('machine.timelapse.post_settings', payload, { action: 'server/timelapse/initSettings' })
    },

    updateCamSettings({ dispatch, state }, payload) {
        // check if the changed webcam is the timelapse webcam, if not stop here
        if (state.settings.camera !== payload.oldName) return

        // send the new webcam name; if it is the same name, it will only update the settings
        dispatch('saveSetting', { camera: payload.newName })
    },

    resetSnackbar({ commit }) {
        commit('resetSnackbar')
    },
}
