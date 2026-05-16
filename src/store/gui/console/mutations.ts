import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import { GuiConsoleState, GuiConsoleStateFilter } from '@/store/gui/console/types'

export const mutations: MutationTree<GuiConsoleState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    filterStore(state, payload: { id: string; value: GuiConsoleStateFilter }) {
        Vue.set(state.consolefilters, payload.id, payload.value)
    },

    filterUpdate(state, payload: { id: string; value: Partial<GuiConsoleStateFilter> }) {
        if (!(payload.id in state.consolefilters)) return

        const filter = { ...state.consolefilters[payload.id] }
        Object.assign(filter, payload.value)

        Vue.set(state.consolefilters, payload.id, filter)
    },

    filterDelete(state, id: string) {
        if (!(id in state.consolefilters)) return

        Vue.delete(state.consolefilters, id)
    },
}
