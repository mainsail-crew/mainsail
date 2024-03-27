import { Module } from 'vuex'
import { GuiMaintenanceState } from '@/store/gui/maintenance/types'
import { actions } from '@/store/gui/maintenance/actions'
import { mutations } from '@/store/gui/maintenance/mutations'
import { getters } from '@/store/gui/maintenance/getters'

export const getDefaultState = (): GuiMaintenanceState => {
    return {
        entries: {},
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const maintenance: Module<GuiMaintenanceState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
