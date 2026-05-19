import Vue from 'vue'
import { MutationTree } from 'vuex'
import { GuiMaintenanceState, GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import { getDefaultState } from './index'

export const mutations: MutationTree<GuiMaintenanceState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload: Record<string, GuiMaintenanceStateEntry>): void {
        Vue.set(state, 'entries', payload)
    },

    store(state, payload: { id: string; entry: GuiMaintenanceStateEntry }): void {
        Vue.set(state.entries, payload.id, payload.entry)
    },

    update(state, payload: { id: string; entry: Partial<GuiMaintenanceStateEntry> }): void {
        if (!(payload.id in state.entries)) return

        const newEntry = { ...state.entries[payload.id], ...payload.entry }
        Vue.set(state.entries, payload.id, newEntry)
    },

    delete(state, id: string): void {
        if (!(id in state.entries)) return

        Vue.delete(state.entries, id)
    },
}
