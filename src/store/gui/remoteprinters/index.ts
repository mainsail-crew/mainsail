import { Module } from 'vuex'
import { actions } from '@/store/gui/remoteprinters/actions'
import { mutations } from '@/store/gui/remoteprinters/mutations'
import { getters } from '@/store/gui/remoteprinters/getters'
import { GuiRemoteprintersState } from '@/store/gui/remoteprinters/types'

export const getDefaultState = (): GuiRemoteprintersState => {
    return {
        printers: {},
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const remoteprinters: Module<GuiRemoteprintersState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
