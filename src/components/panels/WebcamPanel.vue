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
                    <small v-if="this.webcamConfig.service === 'mjpegstreamer-adaptive' &&  this.time">( {{ $t('Panels.WebcamPanel.FPS')}}: {{ currentFPS }})</small>
                </span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-item-group v-if="this.webcams.length>=2">
                <v-menu :offset-y="true" title="Webcam">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn small class="px-2 minwidth-0" color="primary" v-bind="attrs" v-on="on">{{currentCam().name}} <v-icon small>mdi-menu-down</v-icon></v-btn>
                    </template>
                    <v-list dense class="py-0">
                        <v-list-item v-for="webcam of this.webcams" v-bind:key="webcam.index" link @click="selectCam(webcam.name)" :disabled="checkSelectedCam(webcam.name)">
                            <v-list-item-icon class="mr-0">
                                <v-icon small>{{webcam.icon}}</v-icon>
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
            <img :src="url" class="webcamImage" :style="webcamStyle" @load="onLoad" alt="Webcam" v-if="streamValid()" @error="streamNotFound()"/>
            <div style="width: 100%;padding-bottom: 56.75%!important;" v-if="!streamValid()">
                <div style="position:absolute;text-align:center;width:100%;top: 53%;transform: translateY(-50%);" v-if="this.webcams.length === 0">
                    <span><v-icon size="100">mdi-camera-off</v-icon></span><br><br>
                    <span>Please configure a Webcam in the Settings!</span>
                </div>
                <div style="position:absolute;text-align:center;width:100%;top: 53%;transform: translateY(-50%);" v-if="this.webcams.length !== 0">
                    <span><v-icon size="100">mdi-camera-off</v-icon></span><br><br>
                    <span>Please check if the Stream URL is valid!</span>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapGetters,mapState } from 'vuex'

    export default {
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
            document.addEventListener("focus", () => this.handleRefreshChange(), false);
            document.addEventListener("visibilitychange", this.handleRefreshChange, false);
            if(this.webcams.length>=1){
                let currentWebcamConfig = this.currentCam().config
                if(currentWebcamConfig.service === 'mjpegstreamer-adaptive') {
                    this.requestMjpeg()
                }
            }

        },
        components: {

        },
        computed: {
            ...mapState({
                'webcamConfig': state => state.gui.webcam,
            }),
            ...mapGetters({
                webcams: 'gui/getWebcams'
            }),

            url() {
                if(this.webcams.length>=1){
                    let currentWebcamConfig = this.currentCam().config
                    if (currentWebcamConfig.service === 'mjpegstreamer' && currentWebcamConfig.url.indexOf("?") !== -1) {
                        let basicUrl = currentWebcamConfig.url
                        const params = new URLSearchParams(basicUrl)
                        params.set('bypassCache', ""+this.refresh)
                        return decodeURIComponent(params.toString())
                    } else if (currentWebcamConfig.service === 'mjpegstreamer-adaptive') {
                        return this.imageData
                    } else {
                        return currentWebcamConfig.url
                    }
                }
                return ""
            },
            webcamStyle() {
                let transforms = "";
                if (this.currentCam().config.flipX) {
                    transforms += " scaleX(-1)";
                }
                if (this.currentCam().config.flipY) {
                    transforms += " scaleY(-1)";
                }
                if (transforms.trimLeft().length) {
                    return {
                        transform: transforms.trimLeft(),
                    };
                }
                return "";
            },
        },
        methods: {
            currentCam(){
                if(this.webcams.length === 0){
                    return ""
                }
                let currentcam
                for(let camindex = 0; camindex < this.webcams.length; camindex ++){
                    if(this.webcams[camindex].name === this.webcamConfig.selectedCam){
                        currentcam = this.webcams[camindex]
                        break
                    }
                }
                if(typeof(currentcam)==="undefined"){
                    this.selectCam(this.webcams[0].name)
                    return this.webcams[0]
                }
                return currentcam
            },
            streamNotFound(){
                this.validURL=false;
            },
            streamValid(){
                if(this.webcams.length === 0){
                    return false
                }
                if(['mjpegstreamer', 'mjpegstreamer-adaptive'].includes(this.currentCam().config.service)){
                    if(!this.validURL){
                        return false
                    }
                    return true
                }
                return false
            },
            streamAdaptiveMode(){
                if(!this.streamValid()){
                    return false
                }
                if(this.currentCam().config.service === 'mjpegstreamer-adaptive' &&  this.time){
                    return true
                }
                return false
            },
            handleRefreshChange() {
                if (!document.hidden) {
                    this.refresh = Math.ceil(Math.random() * Math.pow(10, 12))
                }
            },
            selectCam(name){
                this.validURL = true
                this.$store.dispatch('gui/setSettings', { webcam: { selectedCam: name } })
            },
            checkSelectedCam(name){
                return this.webcamConfig.selectedCam === name
            },
            onLoad() {
                const end_time = performance.now()
                const current_time = end_time - this.start_time
                this.time = (this.time * this.time_smoothing) + (current_time * (1.0 - this.time_smoothing))
                this.start_time = end_time

                const target_time = 1000/this.currentCam().config.targetFps

                const current_request_time = performance.now() - this.request_start_time
                this.request_time = (this.request_time * this.request_time_smoothing) + (current_request_time * (1.0 - this.request_time_smoothing))
                const timeout = Math.max(0, target_time - this.request_time)

                this.$nextTick(() => {
                    setTimeout(this.requestMjpeg, timeout)
                })
            },
            requestMjpeg() {
                if(!this.isVisible) return
                if(!this.streamValid()) return

                this.request_start_time = performance.now()
                let basicUrl = this.currentCam().config.url
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