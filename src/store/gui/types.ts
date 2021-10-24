export interface GuiState {
    webcam: {
        selectedCam: string
        boolDashboard: boolean,
        boolNavi: boolean,
        configs: GuiStateWebcam[]
    }
    presets: GuiStatePreset[]
    [key: string]: any
}

export interface GuiStateWebcam {
    index?: number | null
    name: string
    icon: string
    service: 'mjpegstreamer' | 'mjpegstreamer-adaptive' | 'uv4l-mjpeg' | 'ipstream'
    targetFps: number
    url: string
    flipX: boolean
    flipY: boolean
}

export interface GuiStatePreset {
    index?: number | null
    name: string
    gcode: string
    values: {
        [key: string]: {
            bool: boolean
            type: string
            value: number
        }
    }
}

export interface GuiStateConsoleFilter {
    bool: boolean
    index?: string
    name: string
    regex: string
}

export interface GuiStateMacrogroup {
    id: string | null
    name: string
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'custom'
    colorCustom?: string
    showInStandby: boolean
    showInPrinting: boolean
    showInPause: boolean
    macros?: GuiStateMacrogroupMacros[]
}

export interface GuiStateMacrogroupMacros {
    pos: number
    name: string
    color: 'group' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
    showInStandby: boolean
    showInPrinting: boolean
    showInPause: boolean
}