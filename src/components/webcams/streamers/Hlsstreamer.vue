<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video
            ref="video"
            v-observe-visibility="visibilityChanged"
            autoplay
            muted
            :style="webcamStyle"
            class="webcamImage"
            @loadedmetadata="onLoadedMetadata" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Hls from 'hls.js'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

@Component
export default class Hlsstreamer extends Mixins(BaseMixin, WebcamMixin) {
    aspectRatio: null | number = null
    isVisible = true
    hls: Hls | null = null

    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null
    @Ref() readonly video!: HTMLVideoElement

    get url() {
        return this.convertUrl(this.camSettings?.stream_url, this.printerUrl)
    }

    get wrapperStyle() {
        return this.getWrapperStyle(this.aspectRatio, this.camSettings.rotation)
    }

    get webcamStyle() {
        return {
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0,
                this.aspectRatio ?? 1
            ),
        }
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible
    }

    mounted() {
        this.play()
    }

    onLoadedMetadata() {
        const w = this.video?.videoWidth
        const h = this.video?.videoHeight

        if (!w || !h) {
            this.aspectRatio = null
            return
        }

        this.aspectRatio = w / h
    }

    updated() {
        this.play()
    }

    play() {
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
            this.hls.attachMedia(this.video)
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.video.play()
            })
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            fetch(this.url).then(() => {
                this.video.src = this.url
                this.video.play()
            })
        }
    }

    beforeUnmount() {
        this.hls?.destroy()
    }
}
</script>
