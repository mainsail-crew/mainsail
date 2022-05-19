import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerTimelapseState } from '@/store/server/timelapse/types'

export const mutations: MutationTree<ServerTimelapseState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setSettings(state, payload) {
        Object.keys(payload).forEach((key) => {
            if (key in state.settings && state.settings[key] !== payload[key])
                Vue.set(state.settings, key, payload[key])
        })
    },

    setLastFrame(state, payload) {
        Vue.set(state.lastFrame, 'count', payload.count)
        Vue.set(state.lastFrame, 'file', payload.file)
    },

    setRenderStatus(state, payload) {
        Vue.set(state, 'rendering', {
            status: payload.status,
            progress: payload.progress ?? 0,
            filename: payload.filename ?? '',
        })
    },

    resetSnackbar(state) {
        Vue.set(state, 'rendering', {
            status: '',
            progress: 0,
            filename: '',
        })
    },
}
