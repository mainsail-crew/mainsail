<template>
    <video ref="stream" class="webcamStream" autoplay muted playsinline></video>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class Webrtc extends Mixins(BaseMixin) {
    private pc: RTCPeerConnection | null = null
    private useStun = false
    private remote_pc_id: string | null = null

    @Prop({ required: true })
    camSettings: any

    @Prop()
    printerUrl: string | undefined

    @Ref() declare stream: HTMLVideoElement

    get url() {
        return this.camSettings.urlStream || ''
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
        this.pc = new RTCPeerConnection(this.streamConfig)
        this.pc.addTransceiver('video', { direction: 'recvonly' })

        this.pc.addEventListener('track', (evt) => {
            if (evt.track.kind == 'video' && this.$refs.stream) {
                // @ts-ignore
                this.$refs.stream.srcObject = evt.streams[0]
            }
        })

        fetch(this.url, {
            body: JSON.stringify({
                type: 'request',
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            mode: 'cors',
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
                fetch(this.url, {
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
}
</script>

<style scoped>
.webcamStream {
    width: 100%;
}
</style>
