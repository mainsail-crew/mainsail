import { ActionContext, ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import { GuiConsoleState, GuiConsoleStateFilter } from '@/store/gui/console/types'

export const actions: ActionTree<GuiConsoleState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async clear({ dispatch }): Promise<void> {
        const cleared_since = new Date().valueOf()
        await dispatch('server/clearGcodeStore', {}, { root: true })
        await dispatch('saveSetting', { name: 'cleared_since', value: cleared_since })
    },

    async saveSetting<T extends keyof GuiConsoleState>(
        { dispatch }: ActionContext<GuiConsoleState, RootState>,
        payload: { name: T; value: GuiConsoleState[T] }
    ) {
        const key = `console.${payload.name}`
        await dispatch('gui/saveSetting', { name: key, value: payload.value }, { root: true })
    },

    async filterUpload({ dispatch }, payload: { id: string; value: GuiConsoleStateFilter }): Promise<void> {
        const key = `console.consolefilters.${payload.id}`
        await dispatch('gui/saveSetting', { name: key, value: payload.value }, { root: true })
    },

    async filterStore({ commit, dispatch }, payload: { value: GuiConsoleStateFilter }): Promise<void> {
        const newPayload = { id: uuidv4(), ...payload }

        commit('filterStore', newPayload)
        await dispatch('filterUpload', newPayload)
    },

    async filterUpdate(
        { commit, dispatch, state },
        payload: { id: string; value: Partial<GuiConsoleStateFilter> }
    ): Promise<void> {
        commit('filterUpdate', payload)
        await dispatch('filterUpload', {
            id: payload.id,
            value: state.consolefilters[payload.id],
        })
    },

    async filterDelete({ commit, dispatch }, id: string): Promise<void> {
        commit('filterDelete', id)

        const key = `console.consolefilters.${id}`
        await dispatch('gui/deleteSetting', key, { root: true })
    },
}
