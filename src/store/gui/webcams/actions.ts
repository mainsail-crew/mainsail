import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { GuiWebcamState } from '@/store/gui/webcams/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'

export const actions: ActionTree<GuiWebcamState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        window.console.debug('init gui/webcams')
        //Vue.$socket.emit('server.database.get_item', { namespace: 'webcams' }, { action: 'gui/webcams/initStore' })
        Vue.$socket.emit('server.webcams.list', {}, { action: 'gui/webcams/initStore' })
    },

    async initStore({ commit, dispatch }, payload) {
        window.console.log('initStore', payload)

        //await commit('reset')
        //await commit('initStore', payload)
        await dispatch('socket/removeInitModule', 'gui/webcam/init', { root: true })
    },

    /*upload(_, payload) {
        Vue.$socket.emit('server.database.post_item', { namespace: 'webcams', key: payload.id, value: payload.value })
    },

    store({ commit, dispatch, state }, payload) {
        const id = uuidv4()

        commit('store', { id, values: payload.values })
        dispatch('upload', {
            id,
            value: state.webcams[id],
        })
    },

    update({ commit, dispatch, state, rootState }, payload) {
        commit('update', payload)
        dispatch('upload', {
            id: payload.id,
            value: state.webcams[payload.id],
        })

        if (
            rootState.server?.components.includes('timelapse') &&
            rootState.server?.timelapse?.settings.camera === payload.id
        ) {
            dispatch('server/timelapse/saveSetting', { camera: payload.id }, { root: true })
        }
    },

    delete({ commit }, payload) {
        commit('delete', payload)
        Vue.$socket.emit('server.database.delete_item', { namespace: 'webcams', key: payload })
    },*/
}
