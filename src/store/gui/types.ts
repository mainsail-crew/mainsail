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
    name: string
    icon: string
    service: "mjpegstreamer" | "mjpegstreamer-adaptive" | "uv4l-mjpeg" | "ipstream"
    targetFps: number
    url: string
    flipX: boolean
    flipY: boolean
}

export interface GuiStatePreset {
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