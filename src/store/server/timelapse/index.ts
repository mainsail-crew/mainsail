import { Module } from 'vuex'
import { ServerTimelapseState } from '@/store/server/timelapse/types'
import { actions } from '@/store/server/timelapse/actions'
import { mutations } from '@/store/server/timelapse/mutations'
import { getters } from '@/store/server/timelapse/getters'

export const getDefaultState = (): ServerTimelapseState => {
    return {
        settings: {
            enabled: 'true',
            mode: 'layermacro',
            autorender: true,
            autorenderOnce: false,
            saveFrames: false,
            gcode_verbose: true,
            parkhead: false,
            parkpos: 'back_left',
            park_custom_pos_x: 0,
            park_custom_pos_y: 0,
            park_custom_pos_dz: 0,
            park_travel_speed: 100,
            park_retract_speed: 15,
            park_retract_distance: 1,
            park_extrude_speed: 15,
            park_extrude_distance: 1,
            hyperlapse_cycle: 30,

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
            previewImage: true
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
