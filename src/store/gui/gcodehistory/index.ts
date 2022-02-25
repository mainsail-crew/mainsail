import { Module } from 'vuex'
import { actions } from '@/store/gui/gcodehistory/actions'
import { mutations } from '@/store/gui/gcodehistory/mutations'
import { getters } from '@/store/gui/gcodehistory/getters'
import { GuiGcodehistoryState } from '@/store/gui/gcodehistory/types'

export const getDefaultState = (): GuiGcodehistoryState => {
    return {
        entries: [],
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const gcodehistory: Module<GuiGcodehistoryState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
