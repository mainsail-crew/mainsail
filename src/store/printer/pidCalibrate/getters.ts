import { GetterTree } from 'vuex'
import { PidCalibrateComparison, buildPidComparison } from '@/store/printer/pidCalibrate/helpers'
import { PrinterPidCalibrateState } from '@/store/printer/pidCalibrate/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<PrinterPidCalibrateState, RootState> = {
    getEntry: (state) => (heaterName: string) => {
        return state.entries[heaterName] ?? null
    },

    isCalibrating: (state) => (heaterName: string) => {
        return state.entries[heaterName]?.status === 'running'
    },

    getComparison:
        (state) =>
        (heaterName: string): PidCalibrateComparison | null => {
            const entry = state.entries[heaterName]
            if (!entry?.previous || !entry?.result) return null

            return buildPidComparison(entry.previous, entry.result)
        },
}
