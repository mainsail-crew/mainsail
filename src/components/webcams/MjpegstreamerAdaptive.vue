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
        <img :src="imageSrc" alt="Preview" :style="webcamStyle" :class="'webcamImage '+(isLoaded ? '' : 'hiddenWebcam')" @load="onLoad" />
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
            },
            refreshFrame() {
                if (this.isVisible) {
                    this.refresh = new Date().getTime()
                    this.setUrl()
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
                    setTimeout(this.refreshFrame, timeout)
                })
            },
            setUrl() {
                const baseUrl = this.camSettings.url
                const hostUrl = new URL(this.printerUrl === null ? document.URL : this.printerUrl)

                const url = new URL(baseUrl, hostUrl.origin)

                url.searchParams.append('bypassCache', this.refresh.toString())
                url.searchParams.set('action', 'snapshot')

                this.request_start_time = performance.now()
                this.currentFPS = Math.round(1000 / this.time)

                this.$nextTick(() => {
                    this.imageSrc = url.toString()
                })
            },
        }
    }
</script>