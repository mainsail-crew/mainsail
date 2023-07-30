<template>
    <div class="d-flex justify-center">
        <video
            ref="video"
            v-observe-visibility="visibilityChanged"
            autoplay
            muted
            :style="webcamStyle"
            class="webcamImage" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Hls from 'hls.js'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

@Component
export default class Hlsstreamer extends Mixins(BaseMixin, WebcamMixin) {
    private aspectRatio: null | number = null
    private isVisible = true
    private hls: Hls | null = null

    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null

    declare $refs: {
        video: HTMLVideoElement
    }

    get url() {
        return this.convertUrl(this.camSettings?.stream_url, this.printerUrl)
    }

    get webcamStyle() {
        const output = {
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0
            ),
            aspectRatio: 16 / 9,
            maxHeight: window.innerHeight - 155 + 'px',
            maxWidth: 'auto',
        }

        if (this.aspectRatio) {
            output.aspectRatio = this.aspectRatio
            output.maxWidth = (window.innerHeight - 155) * this.aspectRatio + 'px'
        }

        return output
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible
    }

    mounted() {
        this.play()

        const video = this.$refs.video
        video.onplaying = () => {
            this.aspectRatio = video.videoWidth / video.videoHeight
        }
    }

    updated() {
        this.play()
    }

    play() {
        const video = this.$refs.video

        if (Hls.isSupported()) {
            this.hls?.destroy()

            this.hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                maxLiveSyncPlaybackRate: 2,
                liveSyncDuration: 0.5,
                liveMaxLatencyDuration: 2,
                backBufferLength: 5,
            })
            this.hls.loadSource(this.url)
            this.hls.attachMedia(video)
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play()
            })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            fetch(this.url).then(() => {
                video.src = this.url
                video.play()
            })
        }
    }

    beforeUnmount() {
        this.hls?.destroy()
    }
}
</script>

<style scoped>
.webcamImage {
    width: 100%;
}
</style>
