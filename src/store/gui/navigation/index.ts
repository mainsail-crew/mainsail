import { Module } from 'vuex'
import { actions } from '@/store/gui/navigation/actions'
import { mutations } from '@/store/gui/navigation/mutations'
import { getters } from '@/store/gui/navigation/getters'
import { GuiNavigationState } from '@/store/gui/navigation/types'

export const getDefaultState = (): GuiNavigationState => {
    return {
        entries: [],
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const navigation: Module<GuiNavigationState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
