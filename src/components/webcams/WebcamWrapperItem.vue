<template>
    <div>
        <template v-if="service === 'mjpegstreamer'">
            <mjpegstreamer-async :cam-settings="webcam" :show-fps="showFps" :printer-url="printerUrl" />
        </template>
        <template v-else-if="service === 'mjpegstreamer-adaptive'">
            <mjpegstreamer-adaptive-async :cam-settings="webcam" :show-fps="showFps" :printer-url="printerUrl" />
        </template>
        <template v-else-if="service === 'uv4l-mjpeg'">
            <uv4l-mjpeg-async :cam-settings="webcam" :printer-url="printerUrl" />
        </template>
        <template v-else-if="service === 'ipstream'">
            <ipstreamer-async :cam-settings="webcam" :printer-url="printerUrl" />
        </template>
        <template v-else-if="service === 'hlsstream'">
            <hlsstreamer-async :cam-settings="webcam" :printer-url="printerUrl" />
        </template>
        <template v-else-if="service === 'jmuxer-stream'">
            <j-muxer-stream-async :cam-settings="webcam" :printer-url="printerUrl" />
        </template>
        <template v-else-if="service === 'webrtc-camerastreamer'">
            <webrtc-camera-streamer-async :cam-settings="webcam" :printer-url="printerUrl" />
        </template>
        <template v-else-if="service === 'webrtc-janus'">
            <janus-streamer-async :cam-settings="webcam" :printer-url="printerUrl" />
        </template>
        <template v-else-if="service === 'webrtc-mediamtx'">
            <webrtc-media-m-t-x-async :cam-settings="webcam" :printer-url="printerUrl" />
        </template>
        <template v-else-if="service === 'webrtc-go2rtc'">
            <webrtc-go2rtc-async :cam-settings="webcam" :printer-url="printerUrl" />
        </template>
        <template v-else>
            <p class="text-center py-3 font-italic">{{ $t('Panels.WebcamPanel.UnknownWebcamService') }}</p>
        </template>
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
        IpstreamerAsync: DynamicCamLoader('Ipstreamer'),
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

    get service() {
        return this.webcam?.service ?? 'unknown'
    }
}
</script>

<style scoped></style>
