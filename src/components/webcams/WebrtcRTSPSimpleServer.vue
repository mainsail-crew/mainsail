<style scoped>
.webcamImage {
    width: 100%;
}
</style>

<template>
    <video
        ref="video"
        v-observe-visibility="visibilityChanged"
        :style="webcamStyle"
        class="webcamImage"
        autoplay
        playsinline
        muted
        controls />
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class WebrtcRTSPSimpleServer extends Mixins(BaseMixin) {
    private isVisible = true

    @Prop({ required: true })
    camSettings: any

    @Prop()
    printerUrl: string | undefined

    @Ref()
    declare video: HTMLVideoElement

    // webrtc player vars
    private webRtcTerminated: boolean = false
    private webRtcWs: any
    private webRtcPc: any
    private webRtcRestartTimeout: any

    mounted() {
        this.video.onload = () => {
            if (this.webRtcTerminated) {
                this.terminateWebRtcVideo() // catch a potential race condition
            } else {
                this.video.play() // trigger autoplay for some browsers
            }
        }
    }

    get webcamStyle() {
        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimLeft().length) return { transform: transforms.trimLeft() }

        return ''
    }

    isWebRtcUrl(): boolean {
        return this.camSettings.urlStream.startsWith('ws://') || this.camSettings.urlStream.startsWith('wss://')
    }

    terminateWebRtcVideo() {
        try {
            this.video.pause()
        } catch (err) {
            // ignore - more important to shut down the sockets.
        }

        this.webRtcTerminate()
    }

    visibilityChanged(isVisible: boolean) {
        this.isVisible = isVisible

        if (!this.isVisible) {
            this.terminateWebRtcVideo()
        } else {
            this.webRtcStart()
            // // TODO: better way to detect ready to play?
            // setTimeout(() => {
            //     this.video.play()
            // }, 500)
        }
    }

    beforeDestroy() {
        this.terminateWebRtcVideo()
    }

    // webrtc player methods
    // adapated from sample player in https://github.com/mrlt8/docker-wyze-bridge
    webRtcStart() {
        // unterminate.. we're starting again.
        this.webRtcTerminated = false

        console.log('connecting')

        if (!this.isWebRtcUrl()) {
            console.error('not a webRtcSrc url')
            return
        }

        this.webRtcWs = new WebSocket(this.camSettings.urlStream)

        this.webRtcWs.onerror = () => {
            console.log('ws error')
            if (this.webRtcWs === null) {
                return
            }
            this.webRtcWs.close()
            this.webRtcWs = null
        }

        this.webRtcWs.onclose = () => {
            console.log('ws closed')
            this.webRtcWs = null
            this.webRtcScheduleRestart()
        }

        this.webRtcWs.onmessage = (msg: any) => this.webRtcOnIceServers(msg)
    }

    webRtcTerminate() {
        this.webRtcTerminated = true

        if (this.webRtcWs) {
            try {
                this.webRtcWs.close()
            } catch (err) {
                // ignore
            }
        }
        if (this.webRtcPc) {
            try {
                this.webRtcPc.close()
            } catch (err) {
                // ignore
            }
        }
    }

    webRtcOnIceServers(msg: any) {
        if (this.webRtcWs === null) {
            return
        }

        const iceServers = JSON.parse(msg.data)

        this.webRtcPc = new RTCPeerConnection({
            iceServers,
        })

        this.webRtcWs.onmessage = (msg: any) => this.webRtcOnRemoteDescription(msg)
        this.webRtcPc.onicecandidate = (evt: any) => this.webRtcOnIceCandidate(evt)

        this.webRtcPc.oniceconnectionstatechange = () => {
            if (this.webRtcPc === null) {
                return
            }

            console.log('peer connection state:', this.webRtcPc.iceConnectionState)

            switch (this.webRtcPc.iceConnectionState) {
                case 'disconnected':
                    this.webRtcScheduleRestart()
            }
        }

        this.webRtcPc.ontrack = (evt: any) => {
            console.log('new track ' + evt.track.kind)
            this.video.srcObject = evt.streams[0]

            // if ( !this.webRtcTerminated ){
            //     setTimeout( () => {
            //         this.video.play();
            //     }, 500);
            // } else {
            //     this.webRtcTerminate(); // re-terminate in case of race condition
            // }
        }

        const direction = 'sendrecv'
        this.webRtcPc.addTransceiver('video', { direction })
        this.webRtcPc.addTransceiver('audio', { direction })

        this.webRtcPc.createOffer().then((desc: any) => {
            if (this.webRtcPc === null || this.webRtcWs === null) {
                return
            }

            this.webRtcPc.setLocalDescription(desc)

            console.log('sending offer')
            this.webRtcWs.send(JSON.stringify(desc))
        })
    }

    webRtcOnRemoteDescription(msg: any) {
        if (this.webRtcPc === null || this.webRtcWs === null) {
            return
        }

        this.webRtcPc.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)))
        this.webRtcWs.onmessage = (msg: any) => this.webRtcOnRemoteCandidate(msg)
    }

    webRtcOnIceCandidate(evt: any) {
        if (this.webRtcWs === null) {
            return
        }

        if (evt.candidate !== null) {
            if (evt.candidate.candidate !== '') {
                this.webRtcWs.send(JSON.stringify(evt.candidate))
            }
        }
    }

    webRtcOnRemoteCandidate(msg: any) {
        if (this.webRtcPc === null) {
            return
        }

        this.webRtcPc.addIceCandidate(JSON.parse(msg.data))
    }

    webRtcScheduleRestart() {
        if (this.webRtcWs !== null) {
            this.webRtcWs.close()
            this.webRtcWs = null
        }

        if (this.webRtcPc !== null) {
            this.webRtcPc.close()
            this.webRtcPc = null
        }

        if (this.webRtcTerminated) {
            return
        }

        this.webRtcRestartTimeout = window.setTimeout(() => {
            this.webRtcRestartTimeout = null
            this.webRtcStart()
        }, 2000)
    }
}
</script>
