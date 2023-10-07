import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import { GuiPresetsState } from '@/store/gui/presets/types'

export const mutations: MutationTree<GuiPresetsState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        if ('cooldownGcode' in payload.value) {
            Vue.set(state, 'cooldownGcode', payload.value.cooldownGcode)
            delete payload.value.cooldownGcode
        }

        Vue.set(state, 'presets', payload.value)
    },

    store(state, payload) {
        Vue.set(state.presets, payload.id, payload.values)
    },

    update(state, payload) {
        if (!(payload.id in state.presets)) return

        Vue.set(state.presets, payload.id, payload.values)
    },

    updateCooldownGcode(state, payload) {
        Vue.set(state, 'cooldownGcode', payload)
    },

    delete(state, payload) {
        if (payload in state.presets) {
            Vue.delete(state.presets, payload)
        }
    },
}
