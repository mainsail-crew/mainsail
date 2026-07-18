import { Module } from 'vuex'
import { actions } from '@/store/gui/webcams/actions'
import { mutations } from '@/store/gui/webcams/mutations'
import { getters } from '@/store/gui/webcams/getters'
import { GuiWebcamState } from '@/store/gui/webcams/types'
import { RootState } from '@/store/types'

export const getDefaultState = (): GuiWebcamState => {
    return {
        webcams: [],
    }
}

// initial state
const state = getDefaultState()

export const webcams: Module<GuiWebcamState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
