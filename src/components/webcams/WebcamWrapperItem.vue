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

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { DynamicCamLoader } from '@/components/webcams/streamers/DynamicCamLoader'

@Component({
    components: {
        HlsstreamerAsync: DynamicCamLoader('Hlsstreamer'),
        HtmlVideoAsync: DynamicCamLoader('HtmlVideo'),
        HtmlIframeAsync: DynamicCamLoader('HtmlIframe'),
        JanusStreamerAsync: DynamicCamLoader('JanusStreamer'),
        JMuxerStreamAsync: DynamicCamLoader('JMuxerStream'),
        MjpegstreamerAsync: DynamicCamLoader('Mjpegstreamer'),
        MjpegstreamerAdaptiveAsync: DynamicCamLoader('MjpegstreamerAdaptive'),
        Uv4lMjpegAsync: DynamicCamLoader('Uv4lMjpeg'),
        WebrtcCameraStreamerAsync: DynamicCamLoader('WebrtcCameraStreamer'),
        WebrtcMediaMTXAsync: DynamicCamLoader('WebrtcMediaMTX'),
        WebrtcGo2rtcAsync: DynamicCamLoader('WebrtcGo2rtc'),
    },
})
export default class WebcamWrapperItem extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) webcam!: GuiWebcamStateWebcam
    @Prop({ type: Boolean, default: true }) showFps!: Boolean
    @Prop({ default: null }) printerUrl!: string | null
    @Prop({ type: String, default: null }) page!: string | null

    get service() {
        return this.webcam?.service ?? 'unknown'
    }
}
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
