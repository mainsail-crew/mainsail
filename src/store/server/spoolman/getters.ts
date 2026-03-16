import { GetterTree } from 'vuex'
import { ServerSpoolmanState } from './types'

export const getters: GetterTree<ServerSpoolmanState, any> = {
    getToolSpool: (state) => (tool: number) => {
        return state.tool_spool_details[tool] ?? null
    },

    hasToolSpools: (state) => {
        return Object.keys(state.tool_spools).length > 0
    },
}
