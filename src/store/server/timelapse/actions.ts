import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerTimelapseState } from '@/store/server/timelapse/types'
import {RootState} from '@/store/types'

export const actions: ActionTree<ServerTimelapseState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit('machine.timelapse.get_settings', {}, { action: 'server/timelapse/initSettings'})
        Vue.$socket.emit('machine.timelapse.lastframeinfo', {}, { action: 'server/timelapse/initLastFrameinfo'})
    },

    initSettings({ commit }, payload) {
        if ('requestParams' in payload) delete payload.requestParams

        commit('setSettings', payload)
    },

    initLastFrameinfo({ commit }, payload) {
        commit('setLastFrame', {
            count: payload.framecount,
            file: payload.lastframefile
        })
    },

    getEvent({ commit }, payload) {
        switch(payload.action) {
        case 'newframe':
            commit('setLastFrame', {
                count: parseInt(payload.frame),
                file: payload.framefile
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

    saveSetting({ commit }, payload) {
        Vue.$socket.emit('machine.timelapse.post_settings', payload, { action: 'server/timelapse/initSettings' })
    },

    resetSnackbar({ commit }) {
        commit('resetSnackbar')
    }
}