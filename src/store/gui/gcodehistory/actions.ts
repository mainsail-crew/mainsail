import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { GuiGcodehistoryState } from '@/store/gui/gcodehistory/types'
import { maxGcodeHistory } from '@/store/variables'

export const actions: ActionTree<GuiGcodehistoryState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    async addToHistory({ dispatch, state }, gcode: string) {
        if (state.entries.at(-1) === gcode) return

        const newHistory = [...state.entries, gcode].slice(-maxGcodeHistory)
        await dispatch('gui/saveSetting', { name: `gcodehistory.entries`, value: newHistory }, { root: true })
    },
}
