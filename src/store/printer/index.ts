import { Module } from 'vuex'
import { PrinterState } from '@/store/printer/types'
import { actions } from '@/store/printer/actions'
import { mutations } from '@/store/printer/mutations'
import { getters } from '@/store/printer/getters'

// import modules
import { tempHistory } from '@/store/printer/tempHistory'
import { RootState } from '@/store/types'

export const getDefaultState = (): PrinterState => {
    return {}
}

// initial state
const state = getDefaultState()

export const printer: Module<PrinterState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        tempHistory,
    },
}
