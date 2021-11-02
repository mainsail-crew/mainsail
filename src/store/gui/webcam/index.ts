import { Module } from 'vuex'
import { actions } from '@/store/gui/webcam/actions'
import { mutations } from '@/store/gui/webcam/mutations'
import { getters } from '@/store/gui/webcam/getters'
import {GuiWebcamState} from '@/store/gui/webcam/types'

export const getDefaultState = (): GuiWebcamState => {
    return {
        webcams: {}
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const webcam: Module<GuiWebcamState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}