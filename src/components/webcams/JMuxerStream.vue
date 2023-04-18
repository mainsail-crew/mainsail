<template>
    <div>
        <video ref="video" autoplay :style="webcamStyle" class="webcamImage" />
        <v-row v-if="status !== 'connected'">
            <v-col class="_webcam_jmuxer_output text-center d-flex flex-column justify-center align-center">
                <v-progress-circular v-if="status === 'connecting'" indeterminate color="primary" class="mb-3" />
                <span class="mt-3">{{ status }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import JMuxer from 'jmuxer'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class JMuxerStreamer extends Mixins(BaseMixin) {
    private jmuxer: JMuxer | null = null
    private status: string = 'connecting'

    @Prop({ required: true })
    camSettings: any

    @Prop()
    printerUrl: string | undefined

    declare $refs: {
        video: HTMLVideoElement
    }

    get url() {
        return this.camSettings.urlStream || ''
    }

    get webcamStyle() {
        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimStart().length) return { transform: transforms.trimStart() }

        return ''
    }

    mounted() {
        window.console.log('jmuxer mounted')
        this.play()
    }

    updated() {
        window.console.log('jmuxer updated')
        this.play()
    }

    play() {
        window.console.log('jmuxer play')
        this.status = 'connecting'
        this.jmuxer?.destroy()

        // Only websocket streams supported
        if (!this.url.startsWith('ws://') && !this.url.startsWith('wss://')) {
            console.error('jmuxer error: only websocket streams supported (ws://.. or wss://..)')
            this.status = 'error'
            return
        }

        const video = this.$refs.video
        const targetFps = this.camSettings.targetFps || 10

        this.jmuxer = new JMuxer({
            node: video,
            mode: 'video',
            flushingTime: 0,
            fps: targetFps,
            // debug: true,
            onReady: (data: any) => {
                this.status = 'connected'
                console.log('jmuxer ready:', data)
            },
            onError: (data: any) => {
                this.status = 'error'
                console.log('jmuxer error:', data)
            },
        })

        const ws = new WebSocket(this.url)
        ws.binaryType = 'arraybuffer'
        ws.addEventListener('message', (event) => {
            this.jmuxer?.feed({
                video: new Uint8Array(event.data),
            })
        })

        ws.addEventListener('error', (event) => {
            this.status = 'error'
            console.log('jmuxer ws error:', event)
        })
    }

    beforeUnmount() {
        window.console.log('jmuxer beforeUnmount')
        this.jmuxer?.destroy()
    }
}
</script>

<style scoped>
.webcamImage {
    width: 100%;
}

._webcam_jmuxer_output {
    aspect-ratio: calc(3 / 2);
}
</style>
