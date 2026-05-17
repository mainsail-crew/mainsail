import { ActionContext, ActionTree } from 'vuex'
import { RootState } from '../../types'
import { GuiHeightmapState } from './types'

export const actions: ActionTree<GuiHeightmapState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async saveSetting<T extends keyof GuiHeightmapState>(
        { dispatch }: ActionContext<GuiHeightmapState, RootState>,
        payload: { name: T; value: GuiHeightmapState[T] }
    ): Promise<void> {
        const key = `heightmap.${payload.name}`
        await dispatch('gui/saveSetting', { name: key, value: payload.value }, { root: true })
    },
}
