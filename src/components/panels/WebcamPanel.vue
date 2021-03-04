<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card v-observe-visibility="visibilityChanged">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading">
                    <v-icon left>mdi-webcam</v-icon> Webcam
                    <small v-if="this.webcamConfig.service === 'mjpegstreamer-adaptive' &&  this.time">(FPS: {{ currentFPS }})</small>
                </span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-0 py-0 content">
            <img :src="url" class="webcamImage" :style="webcamStyle" @load="onLoad"  alt="Webcam" v-if="['mjpegstreamer', 'mjpegstreamer-adaptive'].includes(this.webcamConfig.service)" />
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        data: function() {
            return {
                refresh: Math.ceil(Math.random() * Math.pow(10, 12)),
                connection: "",
                imageData: "",

                request_start_time: performance.now(),
                start_time: performance.now(),
                time: 0,
                request_time: 0,
                time_smoothing: 0.6,
                request_time_smoothing: 0.1,
                isVisible: true,
                currentFPS: 0,
            };
        },
        created: function () {
            document.addEventListener("focus", () => this.handleRefreshChange(), false);
            document.addEventListener("visibilitychange", this.handleRefreshChange, false);

            if(this.webcamConfig.service === 'mjpegstreamer-adaptive') {
                this.requestMjpeg()
            }

        },
        components: {

        },
        computed: {
            ...mapState({
                'webcamConfig': state => state.gui.webcam
            }),

            url() {
                if (this.webcamConfig.service === 'mjpegstreamer' && this.webcamConfig.url.indexOf("?") !== -1) {
                    let basicUrl = this.webcamConfig.url
                    const params = new URLSearchParams(basicUrl)
                    params.set('bypassCache', ""+this.refresh)
                    return decodeURIComponent(params.toString())
                } else if (this.webcamConfig.service === 'mjpegstreamer-adaptive') {
                    return this.imageData
                } else {
                    return this.webcamConfig.url
                }
            },

            webcamStyle() {
                let transforms = '';
                if (this.webcamConfig.flipX) {
                    transforms += ' scaleX(-1)'
                }
                if (this.webcamConfig.flipY) {
                    transforms += ' scaleY(-1)'
                }
                if (this.webcamConfig.rotate && this.webcamConfig.rotateDegrees) {
                    transforms += ` rotate(${this.webcamConfig.rotateDegrees}deg)`
                }
                if (transforms.trimLeft().length) {
                    return {
                        transform: transforms.trimLeft(),
                    }
                }
                return '';
            }
        },
        methods: {
            handleRefreshChange() {
                if (!document.hidden) {
                    this.refresh = Math.ceil(Math.random() * Math.pow(10, 12))
                }
            },

            onLoad() {
                const end_time = performance.now()
                const current_time = end_time - this.start_time
                this.time = (this.time * this.time_smoothing) + (current_time * (1.0 - this.time_smoothing))
                this.start_time = end_time

                const target_time = 1000/this.webcamConfig.targetFps

                const current_request_time = performance.now() - this.request_start_time
                this.request_time = (this.request_time * this.request_time_smoothing) + (current_request_time * (1.0 - this.request_time_smoothing))
                const timeout = Math.max(0, target_time - this.request_time)

                this.$nextTick(() => {
                    setTimeout(this.requestMjpeg, timeout)
                })
            },

            requestMjpeg() {
                if(!this.isVisible) return

                this.request_start_time = performance.now()
                let basicUrl = this.webcamConfig.url
                basicUrl = basicUrl.replace("action=stream", "action=snapshot")
                if (basicUrl && basicUrl.indexOf("?") === -1) basicUrl += "?"

                const params = new URLSearchParams(basicUrl)
                params.set('bypassCache', ""+ this.refresh + (Math.random() * 1000))


                this.currentFPS = Math.round(1000 / this.time)

                this.$nextTick(() => {
                    this.imageData = decodeURIComponent(params.toString())
                })
            },

            visibilityChanged(isVisible) {
                this.isVisible = isVisible
                if(isVisible) this.requestMjpeg()
            }
        }
    }
</script>