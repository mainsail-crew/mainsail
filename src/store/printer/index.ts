import { Module } from 'vuex'
import { PrinterState } from '@/store/printer/types'
import { actions } from '@/store/printer/actions'
import { mutations } from '@/store/printer/mutations'
import { getters } from '@/store/printer/getters'

// import modules
import { tempHistory } from '@/store/printer/tempHistory'

export const getDefaultState = (): PrinterState => {
    return {}
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const printer: Module<PrinterState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        tempHistory,
    },
}
