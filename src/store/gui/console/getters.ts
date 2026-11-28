import { GetterTree } from 'vuex'
import { GuiConsoleState, GuiConsoleStateFilter } from '@/store/gui/console/types'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { timelapseConsoleFilters } from '@/store/variables'
import { RootState } from '@/store/types'

export const getters: GetterTree<GuiConsoleState, RootState> = {
    getConsolefilters: (state): GuiConsoleStateFilter[] => {
        const filters = Object.entries(state.consolefilters).map(([id, filter]) => ({
            ...filter,
            id,
        }))

        return caseInsensitiveSort(filters, 'name')
    },

    getConsolefilterRules: (state): string[] => {
        const output: string[] = []

        if (state.hideWaitTemperatures) {
            output.push('^(?:ok\\s+)?(B|C|T\\d*):')
        }

        if (state.hideTlCommands) {
            output.push(...timelapseConsoleFilters)
        }

        const rules = Object.values(state.consolefilters)
            .filter((filter) => filter.bool)
            .flatMap((filter) => filter.regex.split('\n').filter((rule) => rule !== ''))

        output.push(...rules)

        return output
    },
}
