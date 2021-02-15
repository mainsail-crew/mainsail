<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card v-observe-visibility="visibilityChanged">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-webcam</v-icon>{{subHeading}}</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-0 py-0 content">
            <img :src="url" class="webcamImage" :style="webcamStyle" @load="onLoad"  alt="Webcam"/>
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
            };
        },
        created: function () {
            document.addEventListener("focus", () => this.handleRefreshChange(), false);
            document.addEventListener("visibilitychange", this.handleRefreshChange, false);

            if(this.webcamConfig.serviceMethod == 1) {
                this.requestMjpeg();
            }

        },
        components: {

        },
        computed: {
            ...mapState({
                'webcamConfig': state => state.gui.webcam
            }),

            subHeading() {
                return "Webcam" + (this.webcamConfig.serviceMethod == 1 ? " - FPS: " + Math.round(1000 / this.time) : "");
            },

            url() {
                if(!this.webcamConfig.serviceMethod) {
                    let basicUrl = this.webcamConfig.url
                    if (basicUrl && basicUrl.indexOf("?") === -1) basicUrl += "?"

                    const params = new URLSearchParams(basicUrl)
                    params.set('bypassCache', ""+this.refresh)
                    return decodeURIComponent(params.toString())
                } else {
                    return this.imageData;
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
                var end_time = performance.now();
                var current_time = end_time - this.start_time;
                this.time = (this.time * this.time_smoothing) + (current_time * (1.0 - this.time_smoothing));
                this.start_time = end_time;

                var target_time = 1000/this.webcamConfig.targetFps

                var current_request_time = performance.now() - this.request_start_time;
                this.request_time = (this.request_time * this.request_time_smoothing) + (current_request_time * (1.0 - this.request_time_smoothing));
                var timeout = Math.max(0, target_time - this.request_time);

                this.$nextTick(() => {
                    console.log(end_time + " " + timeout);
                    setTimeout(this.requestMjpeg, timeout);
                })
            },

            requestMjpeg() {
                if(!this.isVisible)
                    return;

                this.request_start_time = performance.now();
                let basicUrl = this.webcamConfig.url
                if (basicUrl && basicUrl.indexOf("?") === -1) basicUrl += "?"

                const params = new URLSearchParams(basicUrl)
                params.set('bypassCache', ""+ this.refresh + (Math.random() * 1000))

                this.$nextTick(() => {
                    this.imageData = decodeURIComponent(params.toString())
                })
            },

            visibilityChanged(isVisible) {
                this.isVisible = isVisible;
                if(isVisible)
                    this.requestMjpeg();
            }
        }
    }
</script>