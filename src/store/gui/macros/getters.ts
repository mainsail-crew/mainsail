import { GetterTree } from 'vuex'
import { GuiMacrosState, GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { RootState } from '@/store/types'

export const getters: GetterTree<GuiMacrosState, RootState> = {
    getAllMacrogroups: (state): GuiMacrosStateMacrogroup[] => {
        const macrogroups: GuiMacrosStateMacrogroup[] = []

        Object.keys(state.macrogroups).forEach((id: string) => {
            macrogroups.push({ ...state.macrogroups[id], id })
        })

        return caseInsensitiveSort(macrogroups, 'name')
    },
}
