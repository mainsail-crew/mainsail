import { Module } from 'vuex'
import { actions } from '@/store/gui/consolefilters/actions'
import { mutations } from '@/store/gui/consolefilters/mutations'
import { getters } from '@/store/gui/consolefilters/getters'
import {GuiConsolefiltersState} from '@/store/gui/consolefilters/types'

export const getDefaultState = (): GuiConsolefiltersState => {
    return {
        consolefilters: {},
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const consolefilters: Module<GuiConsolefiltersState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}