<template>
    <video
        ref="video"
        v-observe-visibility="visibilityChanged"
        autoplay
        muted
        :style="webcamStyle"
        class="webcamImage" />
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Hls from 'hls.js'

@Component
export default class Hlsstreamer extends Mixins(BaseMixin) {
    private isVisible = true
    private hls: Hls | null = null

    @Prop({ required: true })
    camSettings: any

    @Prop()
    printerUrl: string | undefined

    declare $refs: {
        video: HTMLVideoElement
    }

    get url() {
        if (!this.isVisible) return ''

        return this.camSettings.urlStream || ''
    }

    get webcamStyle() {
        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimStart().length) return { transform: transforms.trimStart() }

        return ''
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible
    }

    mounted() {
        this.play()
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
