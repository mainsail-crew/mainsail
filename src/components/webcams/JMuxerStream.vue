<template>
    <video ref="video" v-observe-visibility="visibilityChanged" autoplay :style="webcamStyle" class="webcamImage" />
</template>

<script lang="ts">
import JMuxer from 'jmuxer'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class JMuxerStreamer extends Mixins(BaseMixin) {
    private isVisible = true
    private jmuxer: JMuxer | null = null

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
        if (transforms.trimLeft().length) return { transform: transforms.trimLeft() }

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
        this.jmuxer?.destroy()

        const video = this.$refs.video
        const targetFps = this.camSettings.targetFps || 10

        var jmuxer = (this.jmuxer = new JMuxer({
            node: video,
            mode: 'video',
            flushingTime: 0,
            fps: targetFps,
            // debug: true,
            onReady: function (data) {
                console.log('jmuxer ready:', data)
            },
            onError: function (data) {
                console.log('jmuxer error:', data)
            },
        }))
        var url = this.url

        if (url.startsWith('ws://') || url.startsWith('wss://')) {
            var ws = new WebSocket(url)
            ws.binaryType = 'arraybuffer'
            ws.addEventListener('message', function (event) {
                jmuxer.feed({
                    video: new Uint8Array(event.data),
                })
            })
        } else {
            console.error('jmuxer error: only websocket streams supported (ws://.. or wss://..)')
        }
    }

    beforeUnmount() {
        this.jmuxer?.destroy()
    }
}
</script>

<style scoped>
.webcamImage {
    width: 100%;
}
</style>
