export interface GuiWebcamState {
    webcams: GuiWebcamStateWebcam[]
}

export type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type WebcamOverlayDisplayMode = 'auto' | 'hidden' | 'dummy'

export type OverlayItemKey =
    'extruders' | 'heatbed' | 'fan' | 'speed' | 'flowRate' | 'printTime' | 'estimate' | 'layerCount' | 'eta'

/** `source` selects the data variant for items that offer one (printTime: current|total, estimate: avg|slicer). */
export interface OverlayItemConfig {
    enabled: boolean
    position: OverlayPosition
    source?: string
}

export interface WebcamOverlaysConfig {
    enabled: boolean
    /** Any CSS color; alpha 0 renders no background. */
    backgroundColor?: string
    items?: Partial<Record<OverlayItemKey, OverlayItemConfig>>
}

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
        overlays?: WebcamOverlaysConfig
    }
    source?: 'config' | 'database'
}
