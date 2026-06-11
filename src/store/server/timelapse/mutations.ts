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
                state.settings[key] = payload[key]
        })
    },

    setLastFrame(state, payload) {
        state.lastFrame.count = payload.count
        state.lastFrame.file = payload.file
    },

    setRenderStatus(state, payload) {
        state.rendering = {
            status: payload.status,
            progress: payload.progress ?? 0,
            filename: payload.filename ?? '',
        }
    },

    resetSnackbar(state) {
        state.rendering = {
            status: '',
            progress: 0,
            filename: '',
        }
    },
}
