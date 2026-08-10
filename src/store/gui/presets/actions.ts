import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import { GuiPresetsState, GuiPresetsStatePreset } from '@/store/gui/presets/types'

export const actions: ActionTree<GuiPresetsState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async saveSetting({ dispatch }, payload: { name: string; value: GuiPresetsStatePreset | string }): Promise<void> {
        await dispatch('gui/saveSetting', { name: `presets.${payload.name}`, value: payload.value }, { root: true })
    },

    async updateOrCreate({ dispatch }, payload: GuiPresetsStatePreset): Promise<void> {
        const { id, ...value } = payload
        await dispatch('saveSetting', { name: `presets.${id ?? uuidv4()}`, value })
    },

    async delete({ commit, dispatch }, presetId: string): Promise<void> {
        await dispatch('gui/deleteSetting', `presets.presets.${presetId}`, { root: true })
        commit('delete', presetId)
    },
}
