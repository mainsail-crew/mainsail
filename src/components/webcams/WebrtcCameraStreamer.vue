<template>
    <div>
        <video
            v-show="status === 'connected'"
            ref="stream"
            class="webcamStream"
            :style="webcamStyle"
            autoplay
            muted
            playsinline />
        <v-row v-if="status !== 'connected'">
            <v-col class="_webcam_webrtc_output text-center d-flex flex-column justify-center align-center">
                <v-progress-circular v-if="status === 'connecting'" indeterminate color="primary" class="mb-3" />
                <span class="mt-3">{{ status }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

@Component
export default class WebrtcCameraStreamer extends Mixins(BaseMixin, WebcamMixin) {
    private pc: RTCPeerConnection | null = null
    private useStun = false
    private remote_pc_id: string | null = null
    private aspectRatio: null | number = null
    private status: string = 'connecting'

    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) declare readonly printerUrl: string | null
    @Ref() declare stream: HTMLVideoElement

    get url() {
        const baseUrl = this.camSettings.stream_url
        let url = new URL(baseUrl, this.printerUrl === null ? this.hostUrl.toString() : this.printerUrl)
        url.port = this.hostPort.toString()

        if (baseUrl.startsWith('http') || baseUrl.startsWith('://')) url = new URL(baseUrl)

        return decodeURIComponent(url.toString())
    }

    get webcamStyle() {
        const output = {
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0
            ),
            aspectRatio: 16 / 9,
        }

        if (this.aspectRatio) output.aspectRatio = this.aspectRatio

        return output
    }

    startStream() {
        const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
        const requestIceServers = this.useStun ? [{ urls: ['stun:stun.l.google.com:19302'] }] : null

        // This WebRTC signaling pattern is designed for camera-streamer, a common webcam server the supports WebRTC.
        fetch(this.url, {
            body: JSON.stringify({
                type: 'request',
                iceServers: requestIceServers,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })
            .then((response) => response.json())
            .then((answer) => {
                let peerConnectionConfig: any = {
                    sdpSemantics: 'unified-plan',
                }
                // It's important to set any ICE servers returned, which could include servers we requested or servers
                // setup by the server. But note that older versions of camera-streamer won't return this property.
                if (answer.iceServers) {
                    peerConnectionConfig.iceServers = answer.iceServers
                }
                this.pc = new RTCPeerConnection(peerConnectionConfig)
                this.pc.addTransceiver('video', { direction: 'recvonly' })
                this.pc.addEventListener(
                    'track',
                    (evt) => {
                        if (evt.track.kind == 'video' && this.$refs.stream) {
                            // @ts-ignore
                            this.$refs.stream.srcObject = evt.streams[0]
                        }
                    },
                    false
                )
                this.pc.addEventListener('connectionstatechange', () => {
                    this.status = (this.pc?.connectionState ?? '').toString()
                    if (['failed', 'disconnected'].includes(this.status)) {
                        setTimeout(async () => {
                            await this.pc?.close()
                            this.startStream()
                        }, 500)
                    }
                })
                this.pc.addEventListener('icecandidate', (e) => {
                    if (e.candidate) {
                        return fetch(this.url, {
                            body: JSON.stringify({
                                type: 'remote_candidate',
                                id: this.remote_pc_id,
                                candidates: [e.candidate],
                            }),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            method: 'POST',
                        }).catch(function (error) {
                            window.console.error(error)
                        })
                    }
                })

                this.remote_pc_id = answer.id
                return this.pc?.setRemoteDescription(answer)
            })
            .then(() => this.pc?.createAnswer())
            .then((answer) => this.pc?.setLocalDescription(answer))
            .then(() => {
                const offer = this.pc?.localDescription
                return fetch(this.url, {
                    body: JSON.stringify({
                        type: offer?.type,
                        id: this.remote_pc_id,
                        sdp: offer?.sdp,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                })
            })
            .then((response: any) => {
                if (isFirefox) this.status = 'connected'
                return response.json()
            })
            .catch(function (e) {
                window.console.error(e)
            })
    }

    mounted() {
        this.startStream()
    }

    beforeDestroy() {
        this.pc?.close()
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
