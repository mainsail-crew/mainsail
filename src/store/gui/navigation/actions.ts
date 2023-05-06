import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import Vue from 'vue'
import { GuiNavigationState, GuiNavigationStateEntry } from '@/store/gui/navigation/types'

export const actions: ActionTree<GuiNavigationState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    upload({ state }) {
        Vue.$socket.emit('server.database.post_item', {
            namespace: 'mainsail',
            key: 'navigation.entries',
            value: state.entries,
        })
    },

    updatePos({ commit }, payload: GuiNavigationStateEntry) {
        commit('updatePos', payload)
    },

    changeVisibility({ commit, dispatch }, payload: GuiNavigationStateEntry) {
        commit('changeVisibility', payload)
        dispatch('upload')
    },
}
