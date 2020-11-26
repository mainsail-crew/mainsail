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
            <img :src="webcamConfig.url" class="webcamImage" :style="webcamStyle" />
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        components: {

        },
        computed: {
            ...mapState({
                'webcamConfig': state => state.gui.webcam
            }),
            webcamStyle() {
                var transforms = '';
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
    }
</script>