import { Module } from 'vuex'
import { actions } from '@/store/gui/console/actions'
import { mutations } from '@/store/gui/console/mutations'
import { getters } from '@/store/gui/console/getters'
import { GuiConsoleState } from '@/store/gui/console/types'
import { RootState } from '@/store/types'

export const getDefaultState = (): GuiConsoleState => {
    return {
        hideWaitTemperatures: true,
        hideTlCommands: true,
        direction: 'table',
        entryStyle: 'default',
        height: 300,
        autoscroll: true,
        consolefilters: {},
        rawOutput: false,
    }
}

// initial state
const state = getDefaultState()

export const console: Module<GuiConsoleState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
