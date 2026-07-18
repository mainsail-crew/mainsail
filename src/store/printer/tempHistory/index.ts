import { Module } from 'vuex'
import { PrinterTempHistoryState } from '@/store/printer/tempHistory/types'
import { actions } from '@/store/printer/tempHistory/actions'
import { mutations } from '@/store/printer/tempHistory/mutations'
import { getters } from '@/store/printer/tempHistory/getters'
import { RootState } from '@/store/types'

export const getDefaultState = (): PrinterTempHistoryState => {
    return {
        source: [],
        series: [],
        timeLastUpdate: null,
        updateSourceInterval: null,
    }
}

// initial state
const state = getDefaultState()

export const tempHistory: Module<PrinterTempHistoryState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
