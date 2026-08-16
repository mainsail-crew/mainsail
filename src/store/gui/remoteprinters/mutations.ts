import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import { GuiRemoteprintersState, GuiRemoteprintersStatePrinter } from '@/store/gui/remoteprinters/types'

export const mutations: MutationTree<GuiRemoteprintersState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    save(state, payload: { id: string; value: GuiRemoteprintersStatePrinter }): void {
        Vue.set(state.printers, payload.id, payload.value)
    },

    delete(state, id: string): void {
        if (!(id in state.printers)) return

        Vue.delete(state.printers, id)
    },
}
