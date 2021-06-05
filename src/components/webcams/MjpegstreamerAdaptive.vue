<style>
    .webcamImage {
        width: 100%;
    }

    .hiddenWebcam {
        opacity: 0;
    }

    .webcamFpsOutput {
        display: inline-block;
        position:absolute;
        bottom: 6px;
        right: 0;
        background: rgba(0,0,0,0.8);
        padding: 3px 10px;
        border-top-left-radius: 5px;
    }
</style>

<template>
    <div v-observe-visibility="visibilityChanged" style="position: relative;">
        <div class="text-center py-5" v-if="!isLoaded">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <canvas ref="mjpegstreamerAdaptive" width="600" height="400" :style="webcamStyle" :class="'webcamImage '+(isLoaded ? '' : 'hiddenWebcam')"></canvas>
        <span class="webcamFpsOutput" v-if="isLoaded">{{ $t('Panels.WebcamPanel.FPS')}}: {{ currentFPS }}</span>
    </div>
</template>

<script>

    export default {
        components: {

        },
        data: function() {
            return {
                isVisible: true,
                isLoaded: false,
                timer: null,

                request_start_time: performance.now(),
                start_time: performance.now(),
                time: 0,
                request_time: 0,
                time_smoothing: 0.6,
                request_time_smoothing: 0.1,
                currentFPS: 0,
                imageSrc: "",
            }
        },
        props: {
            camSettings: Object,
            printerUrl: {
                type: String,
                default: null
            }
        },
        created: function () {

        },
        computed: {
            webcamStyle() {
                let transforms = ""
                if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += " scaleX(-1)"
                if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += " scaleY(-1)"
                if (transforms.trimLeft().length) return { transform: transforms.trimLeft() }

                return ""
            },
        },
        methods: {
            visibilityChanged(isVisible) {
                this.isVisible = isVisible

                if (isVisible) this.refreshFrame()
                else {
                    clearTimeout(this.timer)
                    this.timer = null
                }
            },
            refreshFrame() {
                if (this.isVisible) {
                    this.refresh = new Date().getTime()
                    this.setFrame()
                }
            },
            onLoad() {
                this.isLoaded = true

                const targetFps = this.camSettings.targetFps || 10
                const end_time = performance.now()
                const current_time = end_time - this.start_time
                this.time = (this.time * this.time_smoothing) + (current_time * (1.0 - this.time_smoothing))
                this.start_time = end_time

                const target_time = 1000 / targetFps

                const current_request_time = performance.now() - this.request_start_time
                this.request_time = (this.request_time * this.request_time_smoothing) + (current_request_time * (1.0 - this.request_time_smoothing))
                const timeout = Math.max(0, target_time - this.request_time)

                this.$nextTick(() => {
                    this.timer = setTimeout(this.refreshFrame, timeout)
                })
            },
            async setFrame() {
                const baseUrl = this.camSettings.url
                const hostUrl = new URL(this.printerUrl === null ? document.URL : this.printerUrl)

                const url = new URL(baseUrl, hostUrl.origin)

                url.searchParams.append('bypassCache', this.refresh.toString())
                url.searchParams.set('action', 'snapshot')

                this.request_start_time = performance.now()
                this.currentFPS = Math.round(1000 / this.time)

                let canvas = this.$refs.mjpegstreamerAdaptive
                if (canvas !== undefined && canvas.getContext) {
                    const ctx = canvas.getContext('2d')
                    const frame = await this.loadImage(url.toString())

                    canvas.width = canvas.clientWidth
                    canvas.height = canvas.clientWidth * (frame.height / frame.width)

                    ctx.drawImage(frame,
                        0, 0, frame.width, frame.height,
                        0, 0, canvas.width, canvas.height)
                    this.isLoaded = true
                }

                this.$nextTick(() => {
                    this.onLoad()
                })
            },
            loadImage(url) {
                return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
            },
        }
    }
</script>