<style scoped>
.webcamImage {
    width: 100%;
}
</style>

<template>
    <video
        ref="video"
        v-observe-visibility="visibilityChanged"
        :src="url"
        autoplay
        :style="webcamStyle"
        class="webcamImage"
        playsinline
        muted
        controls />
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import WebRtcVideoPlayer from '@/plugins/WebRtcVideoPlayer'

@Component
export default class Ipstreamer extends Mixins(BaseMixin) {
    private isVisible = true

    private webRtcVideoPlayer: WebRtcVideoPlayer | null = null

    @Prop({ required: true })
    camSettings: any

    @Prop()
    printerUrl: string | undefined

    @Ref()
    declare video: HTMLVideoElement

    isWebRtcUrl(): boolean {
        return this.camSettings.urlStream.startsWith('ws://')
    }

    get url() {
        if (this.isWebRtcUrl()) return ''

        if (!this.isVisible) return ''

        return this.camSettings.urlStream || ''
    }

    get webcamStyle() {
        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimLeft().length) return { transform: transforms.trimLeft() }

        return ''
    }

    terminateWebRtcVideo() {
        if (this.webRtcVideoPlayer) {
            try {
                this.video.pause()
            } catch (err) {
                // ignore - more important to shut down the sockets.
            }

            if (this.webRtcVideoPlayer) {
                this.webRtcVideoPlayer.terminate()
                this.webRtcVideoPlayer = null
            }
        }
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible

        if (this.isWebRtcUrl()) {
            if (!this.isVisible) {
                this.terminateWebRtcVideo()
            } else {
                this.webRtcVideoPlayer = new WebRtcVideoPlayer(this.video, this.camSettings.urlStream)
                this.webRtcVideoPlayer.start()
                // TODO: better way to detect ready to play?
                setTimeout(() => {
                    this.video.play()
                }, 500)
            }
        }
    }

    beforeDestroy() {
        this.terminateWebRtcVideo()
    }
}
</script>
