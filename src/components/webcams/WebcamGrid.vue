<style></style>

<template>
    <v-container v-if="webcams" fluid class="pb-4">
        <v-row dense>
            <v-col v-for="webcam in webcams" :key="webcam.id" cols="6">
                <template v-if="webcam.service === 'mjpegstreamer'">
                    <webcam-mjpegstreamer :cam-settings="webcam" />
                </template>
                <template v-else-if="webcam.service === 'mjpegstreamer-adaptive'">
                    <webcam-mjpegstreamer-adaptive :cam-settings="webcam" />
                </template>
                <template v-else-if="webcam.service === 'uv4l-mjpeg'">
                    <webcam-uv4l-mjpeg :cam-settings="webcam" />
                </template>
                <template v-else-if="webcam.service === 'ipstream'">
                    <webcam-ipstreamer :cam-settings="webcam" />
                </template>
                <template v-else-if="webcam.service === 'hlsstream'">
                    <webcam-hlsstreamer :cam-settings="webcam" />
                </template>
                <template v-else-if="webcam.service === 'webrtc-camerastreamer'">
                    <webcam-webrtc-camerastreamer :cam-settings="webcam" />
                </template>
                <template v-else-if="webcam.service === 'webrtc-rtspsimpleserver'">
                    <webcam-webrtc-rtspsimpleserver :cam-settings="webcam" />
                </template>
                <template v-else>
                    <p class="text-center py-3 font-italic">{{ $t('Panels.WebcamPanel.UnknownWebcamService') }}</p>
                </template>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Mjpegstreamer from '@/components/webcams/Mjpegstreamer.vue'
import MjpegstreamerAdaptive from '@/components/webcams/MjpegstreamerAdaptive.vue'
import Uv4lMjpeg from '@/components/webcams/Uv4lMjpeg.vue'
import Ipstreamer from '@/components/webcams/Ipstreamer.vue'
import Hlsstreamer from '@/components/webcams/Hlsstreamer.vue'
import WebrtcCameraStreamer from '@/components/webcams/WebrtcCameraStreamer.vue'
import WebrtcRTSPSimpleServer from '@/components/webcams/WebrtcRTSPSimpleServer.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

@Component({
    components: {
        'webcam-mjpegstreamer': Mjpegstreamer,
        'webcam-mjpegstreamer-adaptive': MjpegstreamerAdaptive,
        'webcam-uv4l-mjpeg': Uv4lMjpeg,
        'webcam-ipstreamer': Ipstreamer,
        'webcam-hlsstreamer': Hlsstreamer,
        'webcam-webrtc-camerastreamer': WebrtcCameraStreamer,
        'webrtc-rtspsimpleserver': WebrtcRTSPSimpleServer,
    },
})
export default class WebcamGrid extends Mixins(BaseMixin) {
    @Prop() declare readonly webcams: GuiWebcamStateWebcam[]
}
</script>
