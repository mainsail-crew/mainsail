<template>
    <div>
        <video
            v-show="status === 'started'"
            ref="stream"
            class="webcamStream"
            :style="webcamStyle"
            autoplay
            muted
            playsinline />
        <v-row v-if="status !== 'started'">
            <v-col class="_webcam_webrtc_output text-center d-flex flex-column justify-center align-center">
                <v-progress-circular v-if="status === 'connecting'" indeterminate color="primary" class="mb-3" />
                <span class="mt-3">{{ status }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import { JanusJs, JanusSession, JanusStreamingPlugin } from 'typed_janus_js'
import BaseMixin from '@/components/mixins/base'
import { ConstructorOptions } from 'typed_janus_js/src/interfaces/janus'

@Component
export default class JanusStreamer extends Mixins(BaseMixin) {
    private janusClient: JanusJs | null = null
    private session: JanusSession | null = null
    private handle: JanusStreamingPlugin | null = null
    private useStun = false
    private pc: RTCPeerConnection | null = null
    private aspectRatio: null | number = null
    private status: string = 'connecting'

    @Prop({ required: true })
    camSettings: any

    @Prop({ default: null }) declare readonly printerUrl: string | null

    @Ref() declare stream: HTMLVideoElement

    get url() {
        const baseUrl = this.camSettings.urlStream
        let url = new URL(baseUrl, this.printerUrl === null ? this.hostUrl.toString() : this.printerUrl)
        url.port = '8188'
        url.protocol = this.printerUrl?.startsWith('https') ? 'wss' : 'ws'

        if (baseUrl.startsWith('ws') || baseUrl.startsWith('http')) {
            url = new URL(baseUrl)
        }

        return url
    }

    get streamId() {
        return /stream=(\d+)/.exec(this.camSettings.urlStream)?.pop()
    }

    get webcamStyle() {
        const output = {
            transform: 'none',
            aspectRatio: 16 / 9,
        }

        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimStart().length) output.transform = transforms.trimStart()

        if (this.aspectRatio) output.aspectRatio = this.aspectRatio

        return output
    }

    get streamConfig() {
        let config: ConstructorOptions = {
            server: this.url.toString(),
        }

        if (this.useStun) {
            config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }]
        }

        return config
    }

    async startStream() {
        this.janusClient = new JanusJs(this.streamConfig)
        await this.janusClient.init({ debug: false })
        this.session = await this.janusClient.createSession()
        this.handle = await this.session.attach<JanusStreamingPlugin>(JanusStreamingPlugin, {})
        this.handle?.onMessage.subscribe(async ({ message, jsep }) => {
            if (message?.result?.status) {
                this.status = message.result.status;
            }
            if (jsep) {
                const answer = await this.handle?.createAnswer({ jsep })
                this.handle?.send({ message: { request: 'start' }, jsep: answer })
            }
        })
        const remoteStream = new MediaStream()
        JanusJs.attachMediaStream(this.$refs.stream as HTMLMediaElement, remoteStream)
        this.handle?.onRemoteTrack.subscribe(({ on, track }) => {
            if (on) remoteStream.addTrack(track)
            else remoteStream.removeTrack(track)
        })
        this.handle.onIceState.subscribe((value) => {
            console.log(`ICE state changed to ${value}`);
        })
        this.handle.onError.subscribe((value) => {
            this.status = `errored: ${JSON.stringify(value)}`
        })
        await this.handle.send({ message: { request: 'watch', id: parseInt(this.streamId!) } })
    }

    mounted() {
        this.startStream()
    }

    beforeDestroy() {
        this.session?.destroy({})
    }

    @Watch('url')
    async changedUrl() {
        await this.pc?.close()
        this.startStream()
    }
}
</script>

<style scoped>
.webcamStream {
    width: 100%;
}

._webcam_webrtc_output {
    aspect-ratio: calc(3 / 2);
}

video {
    width: 100%;
}
</style>
