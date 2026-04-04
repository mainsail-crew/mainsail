import { Module } from 'vuex'
import { actions } from '@/store/gui/gcodehistory/actions'
import { mutations } from '@/store/gui/gcodehistory/mutations'
import { getters } from '@/store/gui/gcodehistory/getters'
import { GuiGcodehistoryState } from '@/store/gui/gcodehistory/types'
import { RootState } from '@/store/types'

export const getDefaultState = (): GuiGcodehistoryState => {
    return {
        entries: [],
    }
}

// initial state
const state = getDefaultState()

export const gcodehistory: Module<GuiGcodehistoryState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
