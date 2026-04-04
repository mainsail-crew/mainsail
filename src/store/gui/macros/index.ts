import { Module } from 'vuex'
import { actions } from '@/store/gui/macros/actions'
import { mutations } from '@/store/gui/macros/mutations'
import { getters } from '@/store/gui/macros/getters'
import { GuiMacrosState } from '@/store/gui/macros/types'
import { RootState } from '@/store/types'

export const getDefaultState = (): GuiMacrosState => {
    return {
        mode: 'simple',
        hiddenMacros: [],
        macrogroups: {},
    }
}

// initial state
const state = getDefaultState()

export const macros: Module<GuiMacrosState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
