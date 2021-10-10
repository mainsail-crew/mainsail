<style>

</style>

<template>
    <v-container fluid class="pb-4" v-if="webcams">
        <v-row dense>
            <v-col
                v-for="webcam in webcams"
                :key="webcam.name"
                cols="6"
            >
                <template v-if="'service' in webcam && webcam.service === 'mjpegstreamer'">
                    <webcam-mjpegstreamer :cam-settings="webcam"></webcam-mjpegstreamer>
                </template>
                <template v-else-if="'service' in webcam && webcam.service === 'mjpegstreamer-adaptive'">
                    <webcam-mjpegstreamer-adaptive :cam-settings="webcam"></webcam-mjpegstreamer-adaptive>
                </template>
                <template v-else-if="'service' in webcam && webcam.service === 'uv4l-mjpeg'">
                    <webcam-uv4l-mjpeg :cam-settings="webcam"></webcam-uv4l-mjpeg>
                </template>
                <template v-else-if="'service' in webcam && webcam.service === 'ipstream'">
                    <webcam-ipstreamer :cam-settings="webcam"></webcam-ipstreamer>
                </template>
                <template v-else>
                    <p class="text-center py-3 font-italic">{{ $t('Panels.WebcamPanel.UnknownWebcamService') }}</p>
                </template>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Mjpegstreamer from '@/components/webcams/Mjpegstreamer.vue'
import MjpegstreamerAdaptive from '@/components/webcams/MjpegstreamerAdaptive.vue'
import Uv4lMjpeg from '@/components/webcams/Uv4lMjpeg.vue'
import Ipstreamer from '@/components/webcams/Ipstreamer.vue'
import {GuiStateWebcam} from '@/store/gui/types'

@Component({
    components: {
        'webcam-mjpegstreamer': Mjpegstreamer,
        'webcam-mjpegstreamer-adaptive': MjpegstreamerAdaptive,
        'webcam-uv4l-mjpeg': Uv4lMjpeg,
        'webcam-ipstreamer': Ipstreamer,
    }
})
export default class WebcamGrid extends Mixins(BaseMixin) {

    @Prop() readonly webcams!: GuiStateWebcam[]
}
</script>