<template>
    <div>
        <mjpegstreamer-async
            v-if="service === 'mjpegstreamer'"
            :cam-settings="webcam"
            :show-fps="showFps"
            :printer-url="printerUrl"
            :page="page" />
        <mjpegstreamer-adaptive-async
            v-else-if="service === 'mjpegstreamer-adaptive'"
            :cam-settings="webcam"
            :show-fps="showFps"
            :printer-url="printerUrl" />
        <uv4l-mjpeg-async v-else-if="service === 'uv4l-mjpeg'" :cam-settings="webcam" :printer-url="printerUrl" />
        <html-iframe-async v-else-if="service === 'iframe'" :cam-settings="webcam" :printer-url="printerUrl" />
        <html-video-async v-else-if="service === 'html-video'" :cam-settings="webcam" :printer-url="printerUrl" />
        <hlsstreamer-async v-else-if="service === 'hlsstream'" :cam-settings="webcam" :printer-url="printerUrl" />
        <j-muxer-stream-async
            v-else-if="service === 'jmuxer-stream'"
            :cam-settings="webcam"
            :printer-url="printerUrl" />
        <webrtc-camera-streamer-async
            v-else-if="service === 'webrtc-camerastreamer'"
            :cam-settings="webcam"
            :printer-url="printerUrl"
            :page="page" />
        <janus-streamer-async v-else-if="service === 'webrtc-janus'" :cam-settings="webcam" :printer-url="printerUrl" />
        <webrtc-media-m-t-x-async
            v-else-if="service === 'webrtc-mediamtx'"
            :cam-settings="webcam"
            :printer-url="printerUrl"
            :page="page" />
        <webrtc-go2rtc-async v-else-if="service === 'webrtc-go2rtc'" :cam-settings="webcam" :printer-url="printerUrl" />
        <p v-else class="text-center py-3 font-italic">{{ $t('Panels.WebcamPanel.UnknownWebcamService') }}</p>
    </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

const props = defineProps({
    webcam: { type: Object, required: true },
    showFps: { type: Boolean, default: true },
    printerUrl: { default: null },
    page: { type: String, default: null },
})

const service = computed(() => (props.webcam as GuiWebcamStateWebcam)?.service ?? 'unknown')

const MjpegstreamerAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/Mjpegstreamer.vue'))
const MjpegstreamerAdaptiveAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/MjpegstreamerAdaptive.vue'))
const Uv4lMjpegAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/Uv4lMjpeg.vue'))
const HtmlIframeAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/HtmlIframe.vue'))
const HtmlVideoAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/HtmlVideo.vue'))
const HlsstreamerAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/Hlsstreamer.vue'))
const JMuxerStreamAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/JMuxerStream.vue'))
const WebrtcCameraStreamerAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/WebrtcCameraStreamer.vue'))
const JanusStreamerAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/JanusStreamer.vue'))
const WebrtcMediaMTXAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/WebrtcMediaMTX.vue'))
const WebrtcGo2rtcAsync = defineAsyncComponent(() => import('@/components/webcams/streamers/WebrtcGo2rtc.vue'))
</script>

<style scoped>
::v-deep .webcamBackground {
    display: flex;
    justify-content: center;
    overflow: hidden;
    position: relative;
    background: rgba(0, 0, 0, 0.8);
    margin: 0 auto;
    max-height: calc(100vh - 155px);
}

::v-deep .webcamImage {
    width: 100%;
    transform-origin: center center;
    object-fit: contain;
}

html.theme--light ::v-deep .webcamBackground {
    background: rgba(255, 255, 255, 0.7);
}
</style>
