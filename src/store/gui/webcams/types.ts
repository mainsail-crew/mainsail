export interface GuiWebcamState {
    webcams: GuiWebcamStateWebcam[]
}

export type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type WebcamOverlayDisplayMode = 'auto' | 'all' | 'hidden' | 'dummy'

export type OverlayPositionKey =
    | 'overlayExtrudersPosition'
    | 'overlayHeatbedPosition'
    | 'overlayFanSpeedPosition'
    | 'overlayPrintTimePosition'
    | 'overlayEstimatePosition'
    | 'overlayEtaPosition'
    | 'overlayFlowRatePosition'
    | 'overlaySpeedPosition'
    | 'overlayLayerCountPosition'

export type OverlayPrintTimeSource = 'current' | 'total'
export type OverlayEstimateSource = 'avg' | 'slicer'

export const DEFAULT_PRINT_TIME_SOURCE: OverlayPrintTimeSource = 'current'
export const DEFAULT_ESTIMATE_SOURCE: OverlayEstimateSource = 'avg'

export interface GuiWebcamStateWebcam {
    name: string
    location?: string
    service:
        | 'grid'
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
        overlayPosition?: OverlayPosition
        overlayExtrudersPosition?: OverlayPosition
        overlayHeatbedPosition?: OverlayPosition
        overlayFanSpeedPosition?: OverlayPosition
        overlayPrintTimePosition?: OverlayPosition
        overlayEtaPosition?: OverlayPosition
        overlayEstimatePosition?: OverlayPosition
        overlayFlowRatePosition?: OverlayPosition
        overlaySpeedPosition?: OverlayPosition
        overlayLayerCountPosition?: OverlayPosition
        overlayBackgroundColor?: string
        overlayPrintTimeSource?: OverlayPrintTimeSource
        overlayEstimateSource?: OverlayEstimateSource
    }
    source?: 'config' | 'database'
}
