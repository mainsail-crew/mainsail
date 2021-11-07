import { ActionTree } from 'vuex'
import {RootState} from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import {GuiMacrogroupsState} from '@/store/gui/macrogroups/types'

export const actions: ActionTree<GuiMacrogroupsState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        window.console.debug('init gui/macrogroups')
        Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail_macrogroups' }, { action: 'gui/macrogroups/initStore' })
    },

    initStore({ commit }, payload) {
        commit('reset')
        commit('initStore', payload)
    },

    upload({ state }, id) {
        Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail_macrogroups', key: id, value: state.macrogroups[id] })
    },

    async store({ commit, dispatch, state }, payload) {
        const id = uuidv4()

        await commit('store', { id, values: payload.values })
        await dispatch('upload', id)

        return id
    },

    update({ commit, dispatch, state }, payload) {
        commit('update', payload)
        dispatch('upload', payload.id)
    },

    addMacroToMacrogroup({ commit, dispatch }, payload) {
        commit('addMacroToMacrogroup', payload)
        dispatch('upload', payload.id)
    },

    updateMacroFromMacrogroup({ commit, dispatch }, payload) {
        commit('updateMacroFromMacrogroup', payload)
        dispatch('upload', payload.id)
    },

    removeMacroFromMacrogroup({ commit, dispatch }, payload) {
        commit('removeMacroFromMacrogroup', payload)
        dispatch('upload', payload.id)
    },

    delete({ commit }, id) {
        commit('delete', id)
        Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail_macrogroups', key: id })
    },
}