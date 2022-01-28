export interface ServerTimelapseState {
    settings: ServerTimelapseSettingsState
    lastFrame: {
        count: number
        file: string
    }
    rendering: {
        status: string
        progress: number
        filename: string
    }
}

export interface ServerTimelapseSettingsState {
    mode: 'layermacro' | 'hyperlapse'
    enabled: boolean
    camera: string
    autorender: boolean
    autorenderOnce: boolean
    saveframes: boolean
    stream_delay_compensation: number
    gcode_verbose: boolean
    parkhead: boolean
    parkpos: 'center' | 'front_left' | 'front_right' | 'back_left' | 'back_right' | 'custom'
    park_custom_pos_x: number
    park_custom_pos_y: number
    park_custom_pos_dz: number
    park_travel_speed: number
    park_retract_speed: number
    park_retract_distance: number
    park_extrude_speed: number
    park_extrude_distance: number
    park_time: number
    fw_retract: boolean
    hyperlapse_cycle: number

    constant_rate_factor: number
    output_framerate: number
    pixelformat: string
    extraoutputparams: string
    variable_fps: boolean
    targetlength: number
    variable_fps_min: number
    variable_fps_max: number
    rotation: number
    duplicatelastframe: number
    previewimage: boolean
    time_format_code: string
    blockedsettings: string[]
    [key: string]: any
}
