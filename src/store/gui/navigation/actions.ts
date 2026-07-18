import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { GuiNavigationState, GuiNavigationStateEntry } from '@/store/gui/navigation/types'

export const actions: ActionTree<GuiNavigationState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async upload({ state, dispatch }): Promise<void> {
        const key = 'navigation.entries'
        await dispatch('gui/saveSetting', { name: key, value: state.entries }, { root: true })
    },

    updatePos({ commit }, payload: GuiNavigationStateEntry): void {
        commit('update', { parameter: 'position', entry: payload })
    },

    changeVisibility({ commit, dispatch }, payload: GuiNavigationStateEntry & { orgTitle?: string }): void {
        commit('update', { parameter: 'toggleVisibility', entry: payload })
        dispatch('upload')
    },
}
