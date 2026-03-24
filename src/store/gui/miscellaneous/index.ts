import { Module } from 'vuex'
import { actions } from '@/store/gui/miscellaneous/actions'
import { mutations } from '@/store/gui/miscellaneous/mutations'
import { getters } from '@/store/gui/miscellaneous/getters'
import { GuiMiscellaneousState } from '@/store/gui/miscellaneous/types'
import { RootState } from '@/store/types'

export const getDefaultState = (): GuiMiscellaneousState => {
    return {
        entries: {},
    }
}

// initial state
const state = getDefaultState()

export const miscellaneous: Module<GuiMiscellaneousState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
