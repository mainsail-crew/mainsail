import { ActionContext, ActionTree } from 'vuex'
import { RootState } from '../../types'
import { GuiHeightmapState } from './types'

export const actions: ActionTree<GuiHeightmapState, RootState> = {
    saveActiveColorScheme({ commit }, payload: string) {
        commit('saveActiveColorScheme', payload)
    },

    async saveSetting<T extends keyof GuiHeightmapState>(
        { dispatch }: ActionContext<GuiHeightmapState, RootState>,
        payload: { name: T; value: GuiHeightmapState[T] }
    ) {
        const key = `heightmap.${payload.name}`
        await dispatch('gui/saveSetting', { name: key, value: payload.value }, { root: true })
    },
}
