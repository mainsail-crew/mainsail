import { ActionTree } from 'vuex'
import {RootState} from '@/store/types'
import {GuiWebcamState} from '@/store/gui/webcam/types'

export const actions: ActionTree<GuiWebcamState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        window.console.log('init webcams')
        //Vue.$socket.emit('machine.device_power.devices', {}, { action: 'server/power/getDevices'})
    },

    upload(_, payload) {
        window.console.log('upload', payload)
    },

    create({ commit, dispatch, state }, payload) {
        const id = await commit('store', payload)
        dispatch('upload', {
            id,
            newVal: state.webcams[id]
        })
    },

    update({ commit, dispatch, state }, payload) {
        commit('update', payload)
        dispatch('upload', {
            id: payload.id,
            newVal: state.webcams[payload.id]
        })
    },

    destroy({ commit }, payload) {
        commit('delete', payload)
        //TODO: delete webcam on moonraker db
        /*dispatch('updateSettings', {
            keyName: 'webcam.configs',
            newVal: state.webcam.configs
        })*/
    },
}