export interface ServerTimelapseState {
    settings: ServerTimelapseSettingsState,
    lastFrame: {
        count: number
        file: string
    }
}

export interface ServerTimelapseSettingsState {
    enabled: boolean
    autorender: boolean
    autorenderOnce: boolean
    constant_rate_factor: number
    output_framerate: number
    pixelformat: string
    extraoutputparams: string
    variable_fps: boolean
    targetlength: number
    variable_fps_min: number
    variable_fps_max: number
    rotation: number
    dublicatelastframe: number
    previewImage: boolean
    preserveFrames: boolean
    [key: string]: any
}