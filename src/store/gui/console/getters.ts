import { GetterTree } from 'vuex'
import { GuiConsoleState, GuiConsoleStateFilter } from '@/store/gui/console/types'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { timelapseConsoleFilters } from '@/store/variables'

// eslint-disable-next-line
export const getters: GetterTree<GuiConsoleState, any> = {
    getConsolefilters: (state) => {
        const consolefilters: GuiConsoleStateFilter[] = []

        Object.keys(state.consolefilters).forEach((id: string) => {
            consolefilters.push({ ...state.consolefilters[id], id })
        })

        return caseInsensitiveSort(consolefilters, 'name')
    },

    getConsolefilterRules: (state, getters, rootState) => {
        const output = []

        if (rootState.gui.console.hideWaitTemperatures) output.push('^(?:ok\\s+)?(B|C|T\\d*):')

        if (rootState.gui.console.hideTlCommands)
            timelapseConsoleFilters.forEach((rule: string) => {
                output.push(rule)
            })

        Object.keys(state.consolefilters).forEach((id: string) => {
            const filter = state.consolefilters[id]
            if (filter.bool) {
                filter.regex.split('\n').forEach((rule: string) => {
                    if (rule !== '') output.push(rule)
                })
            }
        })

        return output
    },

    getConsoleClearedSince: (state) => {
        return state.cleared_since
    },
}
