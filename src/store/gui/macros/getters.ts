import { GetterTree } from 'vuex'
import {GuiMacrogroupsState, GuiMacrogroupsStateMacrogroup} from '@/store/gui/macros/types'
import {caseInsensitiveSort} from '@/plugins/helpers'

// eslint-disable-next-line
export const getters: GetterTree<GuiMacrogroupsState, any> = {

    getAllMacrogroups: (state) => {
        const macrogroups: GuiMacrogroupsStateMacrogroup[] = []

        Object.keys(state.macrogroups).forEach((id: string) => {
            macrogroups.push({...state.macrogroups[id], id})
        })

        return caseInsensitiveSort(macrogroups, 'name')
    },

    getMacrogroup: (state) => (id: string) => {
        return state.macrogroups[id]
    },
}