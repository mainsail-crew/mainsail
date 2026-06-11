import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiRemoteprintersState } from '@/store/gui/remoteprinters/types'

export const mutations: MutationTree<GuiRemoteprintersState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    store(state, payload) {
        state.printers[payload.id] = payload.values
    },

    update(state, payload) {
        if (payload.id in state.printers) {
            const preset = { ...state.printers[payload.id] }
            Object.assign(preset, payload.values)

            state.printers[payload.id] = preset
        }
    },

    delete(state, payload) {
        if (payload in state.printers) {
            delete state.printers[payload]
        }
    },
}
