import { GetterTree } from 'vuex'
import { GuiMacrosState, GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'
import { caseInsensitiveSort } from '@/plugins/helpers'

// eslint-disable-next-line
export const getters: GetterTree<GuiMacrosState, any> = {
    getAllMacrogroups: (state) => {
        const macrogroups: GuiMacrosStateMacrogroup[] = []

        Object.keys(state.macrogroups).forEach((id: string) => {
            macrogroups.push({ ...state.macrogroups[id], id })
        })

        return caseInsensitiveSort(macrogroups, 'name')
    },

    getMacrogroup: (state) => (id: string) => {
        return state.macrogroups[id]
    },
}
