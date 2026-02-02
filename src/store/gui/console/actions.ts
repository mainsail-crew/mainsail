import { ActionTree, ActionContext } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import { GuiConsoleState, GuiConsoleStateFilter } from '@/store/gui/console/types'

export const actions: ActionTree<GuiConsoleState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    async clear({ dispatch }) {
        const cleared_since = new Date().valueOf()
        dispatch('server/clearGcodeStore', {}, { root: true })
        await dispatch('saveSetting', { name: 'cleared_since', value: cleared_since })
    },

    async saveSetting<T extends keyof GuiConsoleState>(
        { dispatch }: ActionContext<GuiConsoleState, RootState>,
        payload: { name: T; value: GuiConsoleState[T] }
    ) {
        const key = `console.${payload.name}`
        await dispatch('gui/saveSetting', { name: key, value: payload.value }, { root: true })
    },

    async filterUpload({ dispatch }, payload: { id: string; value: GuiConsoleStateFilter }) {
        const key = `console.consolefilters.${payload.id}`
        await dispatch('gui/saveSetting', { name: key, value: payload.value }, { root: true })
    },

    async filterStore({ dispatch }, payload) {
        const id = uuidv4()

        await dispatch('filterUpload', { id, value: payload.values })
    },

    async filterUpdate({ dispatch, state }, payload) {
        if (!(payload.id in state.consolefilters)) return

        const updated = { ...state.consolefilters[payload.id], ...payload.values }
        await dispatch('filterUpload', { id: payload.id, value: updated })
    },

    async filterDelete({ commit, dispatch }, payload: string) {
        commit('filterDelete', payload)
        const key = `console.consolefilters.${payload}`
        await dispatch('gui/deleteSetting', key, { root: true })
    },
}
