import { ActionTree } from 'vuex'
import {RootState} from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import {GuiConsolefiltersState} from '@/store/gui/consolefilters/types'

export const actions: ActionTree<GuiConsolefiltersState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        window.console.debug('init gui/consolefilters')
        Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail_consolefilters' }, { action: 'gui/consolefilters/initStore' })
    },

    initStore({ commit }, payload) {
        commit('reset')
        commit('initStore', payload)
    },

    upload(_, payload) {
        Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail_consolefilters', key: payload.id, value: payload.value })
    },

    store({ commit, dispatch, state }, payload) {
        const id = uuidv4()

        commit('store', { id, values: payload.values })
        dispatch('upload', {
            id,
            value: state.consolefilters[id]
        })
    },

    update({ commit, dispatch, state }, payload) {
        commit('update', payload)
        dispatch('upload', {
            id: payload.id,
            value: state.consolefilters[payload.id]
        })
    },

    delete({ commit }, payload) {
        commit('delete', payload)
        Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail_consolefilters', key: payload })
    },
}