import { GetterTree } from 'vuex'
import {GuiConsolefiltersState, GuiConsolefiltersStateFilter} from '@/store/gui/consolefilters/types'
import {caseInsensitiveSort} from '@/plugins/helpers'

// eslint-disable-next-line
export const getters: GetterTree<GuiConsolefiltersState, any> = {

    getConsolefilters:(state) => {
        const consolefilters: GuiConsolefiltersStateFilter[] = []

        Object.keys(state.consolefilters).forEach((id: string) => {
            consolefilters.push({...state.consolefilters[id], id})
        })

        return caseInsensitiveSort(consolefilters, 'name')
    },

    getConsolefilterRules:(state, getters, rootState) => {
        const output = []

        if (rootState.gui.console.hideWaitTemperatures)
            output.push('^(?:ok\\s+)?(B|C|T\\d*):')

        if (rootState.gui.console.hideTlCommands) {
            output.push('^_TIMELAPSE_NEW_FRAME')
            output.push('^TIMELAPSE_TAKE_FRAME')
            output.push('^TIMELAPSE_RENDER')
            output.push('^_SET_TIMELAPSE_SETUP')
        }

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
}