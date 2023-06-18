<template>
    <div>
        <template v-if="service === 'mjpegstreamer'">
            <mjpegstreamer :cam-settings="webcam" :show-fps="showFps" />
        </template>
        <template v-else-if="service === 'mjpegstreamer-adaptive'">
            <mjpegstreamer-adaptive :cam-settings="webcam" :show-fps="showFps" />
        </template>
        <template v-else-if="service === 'uv4l-mjpeg'">
            <uv4l-mjpeg :cam-settings="webcam" />
        </template>
        <template v-else-if="service === 'ipstream'">
            <ipstreamer :cam-settings="webcam" />
        </template>
        <template v-else-if="service === 'hlsstream'">
            <hlsstreamer :cam-settings="webcam" />
        </template>
        <template v-else-if="service === 'jmuxer-stream'">
            <j-muxer-stream :cam-settings="webcam" />
        </template>
        <template v-else-if="service === 'webrtc-camerastreamer'">
            <webrtc-camera-streamer :cam-settings="webcam" />
        </template>
        <template v-else-if="service === 'webrtc-janus'">
            <janus-streamer :cam-settings="webcam" />
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

@Component({
    components: {
        Hlsstreamer: () => import('@/components/webcams/Hlsstreamer.vue'),
        Ipstreamer: () => import('@/components/webcams/Ipstreamer.vue'),
        JMuxerStream: () => import('@/components/webcams/JMuxerStream.vue'),
        Mjpegstreamer: () => import('@/components/webcams/Mjpegstreamer.vue'),
        MjpegstreamerAdaptive: () => import('@/components/webcams/MjpegstreamerAdaptive.vue'),
        Uv4lMjpeg: () => import('@/components/webcams/Uv4lMjpeg.vue'),
        WebrtcCameraStreamer: () => import('@/components/webcams/WebrtcCameraStreamer.vue'),
        JanusStreamer: () => import('@/components/webcams/JanusStreamer.vue'),
    },
})
export default class WebcamWrapperItem extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) webcam!: GuiWebcamStateWebcam
    @Prop({ type: Boolean, default: true }) showFps!: Boolean

    get service() {
        return this.webcam?.service ?? 'unknown'
    }
}
</script>

<style scoped></style>
