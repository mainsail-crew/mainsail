<style>

</style>

<template>
    <v-container fluid class="pb-4">
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

<script>
    import Mjpegstreamer from "@/components/webcams/Mjpegstreamer"
    import MjpegstreamerAdaptive from "@/components/webcams/MjpegstreamerAdaptive"
    import Ipstreamer from "@/components/webcams/Ipstreamer"

    export default {
        data: function() {
            return {

            }
        },
        components: {
            'webcam-mjpegstreamer': Mjpegstreamer,
            'webcam-mjpegstreamer-adaptive': MjpegstreamerAdaptive,
            'webcam-ipstreamer': Ipstreamer,
        },
        props: {
            webcams: Array,
        },
        computed: {

        },
        methods: {

        }
    }
</script>