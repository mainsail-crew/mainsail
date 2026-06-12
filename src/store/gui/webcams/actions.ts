import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import type { GuiWebcamState, GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { getSocket, $toast } from '@/store/runtime'

export const actions: ActionTree<GuiWebcamState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        window.console.debug('init gui/webcams')
        getSocket().emit('server.webcams.list', {}, { action: 'gui/webcams/initStore' })
    },

    async initStore({ commit, dispatch }, payload) {
        await commit('reset')
        await commit('initStore', payload.webcams)
        await dispatch('socket/removeInitModule', 'gui/webcam/init', { root: true })
    },

    store(_, payload) {
        getSocket().emit('server.webcams.post_item', payload)
    },

    update({ dispatch, rootState }, payload: { webcam: GuiWebcamStateWebcam; oldWebcamName: string }) {
        getSocket().emit('server.webcams.post_item', payload.webcam)
        if (payload.webcam.name !== payload.oldWebcamName) dispatch('delete', payload.oldWebcamName)

        // check if timelapse plugin is active, if not stop here
        if (!rootState.server?.components.includes('timelapse')) return

        dispatch(
            'server/timelapse/updateCamSettings',
            { newName: payload.webcam.name, oldName: payload.oldWebcamName },
            { root: true }
        )
    },

    delete(_, payload: string) {
        getSocket().emit('server.webcams.delete_item', { name: payload })
    },
}
