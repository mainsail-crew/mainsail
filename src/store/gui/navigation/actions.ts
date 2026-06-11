import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { GuiNavigationState, GuiNavigationStateEntry } from '@/store/gui/navigation/types'
import { getSocket, $toast } from '@/store/runtime'
import { NaviPoint } from '@/composables/useNavigation'

export const actions: ActionTree<GuiNavigationState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    upload({ state }) {
        getSocket().emit('server.database.post_item', {
            namespace: 'mainsail',
            key: 'navigation.entries',
            value: state.entries,
        })
    },

    updatePos({ commit }, payload: GuiNavigationStateEntry) {
        commit('updatePos', payload)
    },

    changeVisibility({ commit, dispatch }, payload: NaviPoint) {
        commit('changeVisibility', payload)
        dispatch('upload')
    },
}
