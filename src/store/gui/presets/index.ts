import { Module } from 'vuex'
import { actions } from '@/store/gui/presets/actions'
import { mutations } from '@/store/gui/presets/mutations'
import { getters } from '@/store/gui/presets/getters'
import { GuiPresetsState } from '@/store/gui/presets/types'
import { RootState } from '@/store/types'

export const getDefaultState = (): GuiPresetsState => {
    return {
        presets: {},
        cooldownGcode: 'TURN_OFF_HEATERS',
    }
}

// initial state
const state = getDefaultState()

export const presets: Module<GuiPresetsState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
