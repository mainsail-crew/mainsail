import { Module } from 'vuex'
import { actions } from '@/store/gui/console/actions'
import { mutations } from '@/store/gui/console/mutations'
import { getters } from '@/store/gui/console/getters'
import { GuiConsoleState } from '@/store/gui/console/types'

export const getDefaultState = (): GuiConsoleState => {
    return {
        hideWaitTemperatures: true,
        hideTlCommands: true,
        direction: 'table',
        entryStyle: 'default',
        height: 300,
        autoscroll: true,
        consolefilters: {},
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const console: Module<GuiConsoleState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
