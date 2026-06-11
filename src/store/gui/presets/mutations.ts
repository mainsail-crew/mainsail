import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiPresetsState } from '@/store/gui/presets/types'

export const mutations: MutationTree<GuiPresetsState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        if ('cooldownGcode' in payload.value) {
            state.cooldownGcode = payload.value.cooldownGcode
            delete payload.value.cooldownGcode
        }

        state.presets = payload.value
    },

    store(state, payload) {
        state.presets[payload.id] = payload.values
    },

    update(state, payload) {
        if (!(payload.id in state.presets)) return

        state.presets[payload.id] = payload.values
    },

    updateCooldownGcode(state, payload) {
        state.cooldownGcode = payload
    },

    delete(state, payload) {
        if (payload in state.presets) {
            delete state.presets[payload]
        }
    },
}
