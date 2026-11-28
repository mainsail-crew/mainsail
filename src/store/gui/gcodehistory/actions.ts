import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { GuiGcodehistoryState } from '@/store/gui/gcodehistory/types'
import { maxGcodeHistory } from '@/store/variables'

export const actions: ActionTree<GuiGcodehistoryState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async addToHistory({ dispatch, state }, gcode: string): Promise<void> {
        const newHistory = [...state.entries]
        newHistory.push(gcode)

        while (newHistory.length > maxGcodeHistory) newHistory.splice(0, 1)

        await dispatch(
            'gui/saveSetting',
            {
                name: 'gcodehistory.entries',
                value: newHistory,
            },
            { root: true }
        )
    },
}
