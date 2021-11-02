export interface GuiWebcamState {
    webcams: {
        [key: string]: GuiWebcamStateWebcam
    },
}

export interface GuiWebcamStateWebcam {
    id?: string
    name: string
    icon: string
    service: 'mjpegstreamer' | 'mjpegstreamer-adaptive' | 'uv4l-mjpeg' | 'ipstream'
    targetFps: number
    urlStream: string
    urlSnapshot: string
    flipX: boolean
    flipY: boolean
}