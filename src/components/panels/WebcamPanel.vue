<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-webcam</v-icon>Webcam</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-0 py-0 content">
            <img :src="url" class="webcamImage" :style="webcamStyle"  alt="Webcam"/>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        data: function() {
            return {
                refresh: Math.ceil(Math.random() * Math.pow(10, 12))
            }
        },
        created: function () {
            document.addEventListener("focus", () => this.handleRefreshChange(), false);
            document.addEventListener("visibilitychange", this.handleRefreshChange, false);
        },
        components: {

        },
        computed: {
            ...mapState({
                'webcamConfig': state => state.gui.webcam
            }),
            url() {
                const params = new URLSearchParams(this.webcamConfig.url);
                params.set('bypassCache', ""+this.refresh);
                return decodeURIComponent(params.toString())
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
            }
        }
    }
</script>