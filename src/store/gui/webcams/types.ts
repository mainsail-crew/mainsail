export interface GuiWebcamState {
    webcams: GuiWebcamStateWebcam[]
}

export interface GuiWebcamStateWebcam {
    name: string
    location?: string
    service:
        | 'hlsstream'
        | 'ipstream'
        | 'jmuxer-stream'
        | 'mjpegstreamer'
        | 'mjpegstreamer-adaptive'
        | 'uv4l-mjpeg'
        | 'webrtc-camerastreamer'
        | 'webrtc-janus'
        | 'webrtc-mediamtx'
    enabled: boolean
    icon: string
    target_fps: number
    target_fps_idle?: number
    stream_url: string
    snapshot_url: string
    flip_horizontal: boolean
    flip_vertical: boolean
    rotation: number
    aspect_ratio?: string
    extra_data?: {
        hideFps?: boolean
    }
    source?: 'config' | 'database'
}
