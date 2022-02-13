import { Module } from 'vuex'
import { ServerTimelapseState } from '@/store/server/timelapse/types'
import { actions } from '@/store/server/timelapse/actions'
import { mutations } from '@/store/server/timelapse/mutations'
import { getters } from '@/store/server/timelapse/getters'

export const getDefaultState = (): ServerTimelapseState => {
    return {
        settings: {
            enabled: true,
            camera: '',
            mode: 'layermacro',
            autorender: true,
            autorenderOnce: false,
            saveframes: false,
            stream_delay_compensation: 0.05,
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
            park_time: 0.1,
            fw_retract: false,
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
            duplicatelastframe: 0,
            previewimage: true,
            time_format_code: '%Y%m%d_%H%M',
            blockedsettings: [],
        },
        lastFrame: {
            count: 0,
            file: '',
        },
        rendering: {
            status: '',
            progress: 0,
            filename: '',
        },
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
    mutations,
}
