import { Module } from 'vuex'
import { actions } from '@/store/gui/remoteprinters/actions'
import { mutations } from '@/store/gui/remoteprinters/mutations'
import { getters } from '@/store/gui/remoteprinters/getters'
import { GuiRemoteprintersState } from '@/store/gui/remoteprinters/types'
import { RootState } from '@/store/types'

export const getDefaultState = (): GuiRemoteprintersState => {
    return {
        printers: {},
    }
}

// initial state
const state = getDefaultState()

export const remoteprinters: Module<GuiRemoteprintersState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
