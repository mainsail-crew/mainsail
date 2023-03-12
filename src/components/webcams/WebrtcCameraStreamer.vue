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

@Component
export default class WebrtcCameraStreamer extends Mixins(BaseMixin) {
    private pc: RTCPeerConnection | null = null
    private useStun = false
    private remote_pc_id: string | null = null
    private aspectRatio: null | number = null
    private status: string = 'connecting'

    @Prop({ required: true })
    camSettings: any

    @Prop({ default: null }) declare readonly printerUrl: string | null

    @Ref() declare stream: HTMLVideoElement

    get url() {
        const baseUrl = this.camSettings.urlStream
        let url = new URL(baseUrl, this.printerUrl === null ? this.hostUrl.toString() : this.printerUrl)
        url.port = this.hostPort.toString()

        if (baseUrl.startsWith('http') || baseUrl.startsWith('://')) url = new URL(baseUrl)

        return decodeURIComponent(url.toString())
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
        let config: any = {
            sdpSemantics: 'unified-plan',
        }

        if (this.useStun) {
            config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }]
        }

        return config
    }

    startStream() {
        const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1

        this.pc = new RTCPeerConnection(this.streamConfig)
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

        fetch(this.url, {
            body: JSON.stringify({
                type: 'request',
                //res: params.res
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })
            .then((response) => response.json())
            .then((answer) => {
                this.remote_pc_id = answer.id
                return this.pc?.setRemoteDescription(answer)
            })
            .then(() => this.pc?.createAnswer())
            .then((answer) => this.pc?.setLocalDescription(answer))
            .then(() => {
                // wait for ICE gathering to complete
                return new Promise((resolve) => {
                    const checkState = () => {
                        if (this.pc?.iceGatheringState === 'complete') {
                            this.pc?.removeEventListener('icegatheringstatechange', checkState)
                            resolve(true)
                        }
                    }

                    if (this.pc?.iceGatheringState === 'complete') resolve(true)
                    else this.pc?.addEventListener('icegatheringstatechange', checkState)
                })
            })
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
