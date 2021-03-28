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
                    <v-icon left>mdi-webcam</v-icon> {{ $t('Panels.WebcamPanel.Webcam')}}
                </span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-item-group v-if="this.webcams.length > 1">
                <v-menu :offset-y="true" title="Webcam">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn small class="px-2 minwidth-0" color="primary" v-bind="attrs" v-on="on">{{ 'name' in currentCam ? currentCam.name : "unknown" }} <v-icon small>mdi-menu-down</v-icon></v-btn>
                    </template>
                    <v-list dense class="py-0">
                        <v-list-item v-for="webcam of this.webcams" v-bind:key="webcam.index" link @click="currentCamName = webcam.name">
                            <v-list-item-icon class="mr-0">
                                <v-icon small>{{ webcam.icon }}</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title v-text="webcam.name"></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-item-group>
        </v-toolbar>
        <v-card-text class="px-0 py-0 content">
            <v-row>
                <v-col class="pb-0" style="position: relative;">
                    <template v-if="'service' in this.currentCam && this.currentCam.service === 'mjpegstreamer'">
                        <vue-load-image>
                            <img slot="image" :src="url" alt="Preview" :style="webcamStyle" class="webcamImage" @load="onLoad" />
                            <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                            <div slot="error" class="text-center py-5">
                                <v-icon x-large>mdi-webcam-off</v-icon>
                                <div class="subtitle-1 mt-2">{{ $t('Settings.WebcamPanel.UrlNotAvailable') }}</div>
                            </div>
                        </vue-load-image>
                    </template>
                    <template v-else-if="'service' in this.currentCam && this.currentCam.service === 'mjpegstreamer-adaptive'">
                        <img slot="image" :src="url" alt="Preview" :style="webcamStyle" class="webcamImage" @load="onLoad" />
                        <span
                            style="
                                position:absolute;
                                bottom: 6px;
                                right: 12px;
                                background: rgba(0,0,0,0.8);
                                width: 75px;
                                padding: 3px 10px;
                                border-top-left-radius: 5px;
                            ">{{ $t('Panels.WebcamPanel.FPS')}}: {{ currentFPS }}</span>
                    </template>
                    <template v-else>
                        <img slot="image" :src="url" alt="Preview" :style="webcamStyle" class="webcamImage" @load="onLoad" />
                    </template>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import VueLoadImage from "vue-load-image"

    export default {
        components: {
            'vue-load-image': VueLoadImage
        },
        data: function() {
            return {
                validURL: true,
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
            document.addEventListener("focus", () => this.handleRefreshChange(), false)
            document.addEventListener("visibilitychange", this.handleRefreshChange, false)
        },
        computed: {
            currentCamName: {
                get() {
                    let currentCamName = this.$store.state.gui.webcam.selectedCam
                    if (currentCamName !== undefined && this.webcams.findIndex(webcam => webcam.name === currentCamName) !== -1)
                        return currentCamName

                    if (this.webcams.length) return this.webcams[0].name

                    return ""
                },
                set(newVal) {
                    return this.$store.dispatch('gui/setSettings', { webcam: { selectedCam: newVal } })
                }
            },
            currentCam() {
                const currentCam = this.webcams.find(webcam => webcam.name === this.currentCamName)
                if (currentCam) return currentCam

                return {}
            },
            webcams: {
                get() {
                    return this.$store.getters["gui/getWebcams"]
                }
            },
            url() {
                if('url' in this.currentCam) {
                    if ('service' in this.currentCam && this.currentCam.service === 'mjpegstreamer' && this.currentCam.url.indexOf("?") !== -1) {
                        let basicUrl = this.currentCam.url
                        const params = new URLSearchParams(basicUrl)
                        params.set('bypassCache', ""+this.refresh)
                        return decodeURIComponent(params.toString())
                    } else if ('service' in this.currentCam && this.currentCam.service === 'mjpegstreamer-adaptive') {
                        return this.imageData
                    }

                    return this.currentCam.url
                }

                return ""
            },
            webcamStyle() {
                let transforms = ""
                if ('flipX' in this.currentCam && this.currentCam.flipX) transforms += " scaleX(-1)"
                if ('flipX' in this.currentCam && this.currentCam.flipY) transforms += " scaleY(-1)"
                if (transforms.trimLeft().length) return { transform: transforms.trimLeft() }

                return ""
            },
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

                const target_time = 1000 / this.currentCam.targetFps

                const current_request_time = performance.now() - this.request_start_time
                this.request_time = (this.request_time * this.request_time_smoothing) + (current_request_time * (1.0 - this.request_time_smoothing))
                const timeout = Math.max(0, target_time - this.request_time)

                this.$nextTick(() => {
                    if (this.isVisible) setTimeout(this.requestMjpeg, timeout)
                    else setTimeout(this.requestMjpeg, 1000)
                })
            },
            requestMjpeg() {
                if (!this.isVisible) return
                if (!('url' in this.currentCam)) return

                this.request_start_time = performance.now()
                let basicUrl = this.currentCam.url
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