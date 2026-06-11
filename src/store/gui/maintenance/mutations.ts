import { MutationTree } from 'vuex'
import { GuiMaintenanceState } from '@/store/gui/maintenance/types'
import { getDefaultState } from './index'

export const mutations: MutationTree<GuiMaintenanceState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        state.entries = payload
    },

    store(state, payload) {
        state.entries[payload.id] = payload.values
    },

    update(state, payload) {
        if (!(payload.id in state.entries)) return

        const entry = { ...state.entries[payload.id] }
        Object.assign(entry, payload.entry)
        state.entries[payload.id] = entry
    },

    delete(state, payload) {
        if (payload in state.entries) {
            delete state.entries[payload]
        }
    },
}
