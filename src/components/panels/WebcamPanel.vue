<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-webcam</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Webcam</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
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