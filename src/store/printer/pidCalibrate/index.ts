import { Module } from 'vuex'
import { PrinterPidCalibrateState } from '@/store/printer/pidCalibrate/types'
import { actions } from '@/store/printer/pidCalibrate/actions'
import { mutations } from '@/store/printer/pidCalibrate/mutations'
import { getters } from '@/store/printer/pidCalibrate/getters'
import { RootState } from '@/store/types'

export const getDefaultState = (): PrinterPidCalibrateState => {
    return {
        entries: {},
    }
}

// initial state
const state = getDefaultState()

export const pidCalibrate: Module<PrinterPidCalibrateState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
