import type { Webcam } from '@/types/moonraker/WebcamRPC'

export interface GuiWebcamState {
    webcams: GuiWebcamStateWebcam[]
}

export interface GuiWebcamStateWebcam extends Omit<Webcam, 'service' | 'extra_data'> {
    service: GuiWebcamStateWebcamService
    extra_data?: GuiWebcamStateWebcamExtraData
}

export type GuiWebcamStateWebcamService =
    | 'grid'
    | 'hlsstream'
    | 'html-video'
    | 'iframe'
    | 'jmuxer-stream'
    | 'mjpegstreamer'
    | 'mjpegstreamer-adaptive'
    | 'uv4l-mjpeg'
    | 'webrtc-camerastreamer'
    | 'webrtc-go2rtc'
    | 'webrtc-janus'
    | 'webrtc-mediamtx'

export interface GuiWebcamStateWebcamExtraData {
    enableAudio?: boolean
    hideFps?: boolean
    nozzleCrosshair?: boolean
    nozzleCrosshairColor?: string
    nozzleCrosshairSize?: number
}
