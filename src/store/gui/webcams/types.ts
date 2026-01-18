export interface GuiWebcamState {
    webcams: GuiWebcamStateWebcam[]
}

export interface GuiWebcamStateWebcam {
    name: string
    location?: string
    service:
        | 'hlsstream'
        | 'html-video'
        | 'iframe'
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
        enableAudio?: boolean
        hideFps?: boolean
        nozzleCrosshair?: boolean
        nozzleCrosshairColor?: string
        nozzleCrosshairSize?: number
        overlaysEnabled?: boolean
        overlayShowExtruders?: boolean
        overlayShowHeatbed?: boolean
        overlayShowFanSpeed?: boolean
        overlayShowPrintTime?: boolean
        overlayShowEta?: boolean
        overlayShowEstimate?: boolean
        overlayShowFlowRate?: boolean
        overlayShowSpeed?: boolean
        overlayShowLayerCount?: boolean
        overlayPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        overlayExtrudersPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        overlayHeatbedPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        overlayFanSpeedPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        overlayPrintTimePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        overlayEtaPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        overlayEstimatePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        overlayFlowRatePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        overlaySpeedPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        overlayLayerCountPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        overlayBackgroundColor?: string
        overlayPrintTimeSource?: 'current' | 'total'
        overlayEstimateSource?: 'avg' | 'slicer'
    }
    source?: 'config' | 'database'
}
