<style scoped>
.webcamImage {
    width: 100%;
}
</style>

<template>
    <video ref="stream" controls autoplay muted playsinline></video>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Vue } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class Webrtc extends Mixins(BaseMixin) {
    private useStun = false

    @Prop({ required: true })
    camSettings: any

    @Prop()
    printerUrl: string | undefined

    @Ref() declare readonly stream: HTMLVideoElement

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
        window.console.log('start stream')
        window.console.log(this.$refs.stream)

        const pc = new RTCPeerConnection(this.streamConfig)
        pc.addTransceiver('video', { direction: 'recvonly' })

        pc.addEventListener('track', (evt) => {
            window.console.log('track event ' + evt.track.kind)
            if (evt.track.kind == 'video') {
                window.console.log(this.$refs.stream)

                /*if (document.getElementById('stream')) {
                    document.getElementById('stream').srcObject = evt.streams[0];
                }*/
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
            mode: 'cors',
        })
            .then(function (response) {
                window.console.log('response', response)

                return response.json()
            })
            .then(function (answer) {
                window.console.log('answer', answer)
                pc.remote_pc_id = answer.id
                return pc.setRemoteDescription(answer)
            })
            .then(function () {
                return pc.createAnswer()
            })
            .then(function (answer) {
                return pc.setLocalDescription(answer)
            })
            .then(function () {
                // wait for ICE gathering to complete
                return new Promise(function (resolve) {
                    if (pc.iceGatheringState === 'complete') {
                        resolve()
                    } else {
                        function checkState() {
                            if (pc.iceGatheringState === 'complete') {
                                pc.removeEventListener('icegatheringstatechange', checkState)
                                resolve()
                            }
                        }
                        pc.addEventListener('icegatheringstatechange', checkState)
                    }
                })
            })
            .then(function (answer) {
                let offer = pc.localDescription

                return fetch('/webrtc', {
                    body: JSON.stringify({
                        type: offer.type,
                        id: pc.remote_pc_id,
                        sdp: offer.sdp,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                })
            })
            .then(function (response) {
                return response.json()
            })
            .catch(function (e) {
                window.console.error(e)
            })
    }

    mounted() {
        this.startStream()
    }
}
</script>
