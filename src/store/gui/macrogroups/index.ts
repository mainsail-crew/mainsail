import { Module } from 'vuex'
import { actions } from '@/store/gui/macrogroups/actions'
import { mutations } from '@/store/gui/macrogroups/mutations'
import { getters } from '@/store/gui/macrogroups/getters'
import {GuiMacrogroupsState} from '@/store/gui/macrogroups/types'

export const getDefaultState = (): GuiMacrogroupsState => {
    return {
        macroManagement: 'simple',
        hiddenMacros: [],
        macrogroups: {},
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const macrogroups: Module<GuiMacrogroupsState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}