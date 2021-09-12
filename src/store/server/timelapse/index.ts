import { Module } from 'vuex'
import { ServerTimelapseState } from '@/store/server/timelapse/types'
import { actions } from '@/store/server/timelapse/actions'
import { mutations } from '@/store/server/timelapse/mutations'
import { getters } from '@/store/server/timelapse/getters'

export const getDefaultState = (): ServerTimelapseState => {
    return {
        settings: {
            enabled: true,
            autorender: true,
            autorenderOnce: false,
            constant_rate_factor: 23,
            output_framerate: 30,
            pixelformat: 'yuv420p',
            extraoutputparams: '',
            variable_fps: false,
            targetlength: 60,
            variable_fps_min: 5,
            variable_fps_max: 60,
            rotation: 0,
            dublicatelastframe: 0,
            previewImage: true,
            preserveFrames: false
        },
        lastFrame: {
            count: 0,
            file: ''
        }
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const timelapse: Module<ServerTimelapseState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}