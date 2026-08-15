import Vue from 'vue'
import { MutationTree } from 'vuex'
import { PidCalibrateEntry, PrinterPidCalibrateState } from '@/store/printer/pidCalibrate/types'

export const mutations: MutationTree<PrinterPidCalibrateState> = {
    setEntry(state, entry: PidCalibrateEntry) {
        Vue.set(state.entries, entry.heaterName, entry)
    },

    updateEntry(state, payload: { heaterName: string; changes: Partial<PidCalibrateEntry> }) {
        const existingEntry = state.entries[payload.heaterName]
        if (!existingEntry) return

        Vue.set(state.entries, payload.heaterName, { ...existingEntry, ...payload.changes })
    },

    removeEntry(state, heaterName: string) {
        Vue.delete(state.entries, heaterName)
    },
}
