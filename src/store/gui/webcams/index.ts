import { Module } from 'vuex'
import { actions } from '@/store/gui/webcams/actions'
import { mutations } from '@/store/gui/webcams/mutations'
import { getters } from '@/store/gui/webcams/getters'
import { GuiWebcamState } from '@/store/gui/webcams/types'

export const getDefaultState = (): GuiWebcamState => {
    return {
        webcams: [],
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const webcams: Module<GuiWebcamState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
