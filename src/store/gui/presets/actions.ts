import { ActionTree } from 'vuex'
import {RootState} from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import {GuiPresetsState} from '@/store/gui/presets/types'

export const actions: ActionTree<GuiPresetsState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        window.console.debug('init gui/presets')
        Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail_presets' }, { action: 'gui/presets/initStore' })
    },

    initStore({ commit }, payload) {
        commit('reset')
        commit('initStore', payload)
    },

    upload(_, payload) {
        Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail_presets', key: payload.id, value: payload.value })
    },

    store({ commit, dispatch, state }, payload) {
        const id = uuidv4()

        commit('store', { id, values: payload.values })
        dispatch('upload', {
            id,
            value: state.presets[id]
        })
    },

    update({ commit, dispatch, state }, payload) {
        commit('update', payload)
        dispatch('upload', {
            id: payload.id,
            value: state.presets[payload.id]
        })
    },

    updateCooldownGcode({ commit, dispatch }, payload) {
        commit('updateCooldownGcode', payload)
        dispatch('upload', {
            id: 'cooldownGcode',
            value: payload
        })
    },

    delete({ commit }, payload) {
        commit('delete', payload)
        Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail_presets', key: payload })
    },
}