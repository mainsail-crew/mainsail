import Vue from 'vue'

type StreamerTypes =
    | 'Hlsstreamer'
    | 'Ipstreamer'
    | 'JanusStreamer'
    | 'JMuxerStream'
    | 'Mjpegstreamer'
    | 'MjpegstreamerAdaptive'
    | 'Uv4lMjpeg'
    | 'WebrtcCameraStreamer'
    | 'WebrtcMediaMTX'
    | 'WebrtcGo2rtc'

function getDynamicCamImport(componentName: StreamerTypes) {
    // split each webcam streamer into its own chunk
    switch (componentName) {
        case 'Hlsstreamer':
            return () => import('@/components/webcams/streamers/Hlsstreamer.vue')
        case 'Ipstreamer':
            return () => import('@/components/webcams/streamers/Ipstreamer.vue')
        case 'JanusStreamer':
            return () => import('@/components/webcams/streamers/JanusStreamer.vue')
        case 'JMuxerStream':
            return () => import('@/components/webcams/streamers/JMuxerStream.vue')
        case 'Mjpegstreamer':
            return () => import('@/components/webcams/streamers/Mjpegstreamer.vue')
        case 'MjpegstreamerAdaptive':
            return () => import('@/components/webcams/streamers/MjpegstreamerAdaptive.vue')
        case 'Uv4lMjpeg':
            return () => import('@/components/webcams/streamers/Uv4lMjpeg.vue')
        case 'WebrtcCameraStreamer':
            return () => import('@/components/webcams/streamers/WebrtcCameraStreamer.vue')
        case 'WebrtcMediaMTX':
            return () => import('@/components/webcams/streamers/WebrtcMediaMTX.vue')
        case 'WebrtcGo2rtc':
            return () => import('@/components/webcams/streamers/WebrtcGo2rtc.vue')
    }
}

export const DynamicCamLoader = (componentName: StreamerTypes) =>
    Vue.component(componentName, getDynamicCamImport(componentName))
