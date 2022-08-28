import { Module } from 'vuex'
import { actions } from '@/store/gui/miscellaneous/actions'
import { mutations } from '@/store/gui/miscellaneous/mutations'
import { getters } from '@/store/gui/miscellaneous/getters'
import { GuiMiscellaneousState } from '@/store/gui/miscellaneous/types'

export const getDefaultState = (): GuiMiscellaneousState => {
    return {
        entries: {},
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const miscellaneous: Module<GuiMiscellaneousState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
