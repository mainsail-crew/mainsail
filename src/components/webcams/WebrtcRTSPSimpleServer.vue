<template>
    <video ref="video" :style="webcamStyle" class="webcamImage" autoplay playsinline muted controls />
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class WebrtcRTSPSimpleServer extends Mixins(BaseMixin) {
    @Prop({ required: true })
    camSettings: any

    @Prop({ default: false })
    collapsible: boolean | undefined

    @Ref()
    declare video: HTMLVideoElement

    // webrtc player vars
    private webRtcTerminated: boolean = false
    private webRtcWs: any
    private webRtcPc: any
    private webRtcRestartTimeout: any

    beforeMount() {
        // if the panel is not expanded, then flag as already terminated so we don't try to start the connection
        this.webRtcTerminated = !this.expanded
    }

    mounted() {
        if (this.webRtcTerminated) {
            this.webRtcTerminate() // catch a potential race condition
        } else {
            this.webRtcStart()
        }
    }

    // stop the video and close the streams if the component is going to be destroyed so we don't leave hanging streams
    beforeDestroy() {
        this.webRtcTerminate()
    }

    get webcamStyle() {
        let transforms = ''
        if ('flipX' in this.camSettings && this.camSettings.flipX) transforms += ' scaleX(-1)'
        if ('flipX' in this.camSettings && this.camSettings.flipY) transforms += ' scaleY(-1)'
        if (transforms.trimLeft().length) return { transform: transforms.trimLeft() }

        return ''
    }

    isWebRtcUrl(val: string): boolean {
        return val.startsWith('ws://') || val.startsWith('wss://')
    }

    get url() {
        return this.camSettings.urlStream
    }

    // stop and restart the video if the url changes
    @Watch('url')
    changedUrl(newUrl: any) {
        this.webRtcTerminate()
        if (this.isWebRtcUrl(newUrl)) {
            this.webRtcStart()
        }
    }

    get expanded(): any {
        return !this.collapsible || this.$store.getters['gui/getPanelExpand']('webcam-panel', this.viewport)
    }

    // start or stop the video when the expand state changes
    @Watch('expanded')
    expandChanged(newExpanded: any): void {
        if (!newExpanded) {
            this.webRtcTerminate()
        } else {
            this.webRtcStart()
        }
    }

    // webrtc player methods
    // adapated from sample player in https://github.com/mrlt8/docker-wyze-bridge
    webRtcStart() {
        // unterminate.. we're starting again.
        this.webRtcTerminated = false

        // clear any potentially open restart timeout
        clearTimeout(this.webRtcRestartTimeout)
        this.webRtcRestartTimeout = null

        console.log('[webcam-rtspsimpleserver] web socket connecting')

        let url = this.url

        if (!this.isWebRtcUrl(url)) {
            console.error('not a webRtcSrc url')
            return
        }

        this.webRtcWs = new WebSocket(this.camSettings.urlStream)

        this.webRtcWs.onerror = () => {
            console.log('[webcam-rtspsimpleserver] websocket error')
            if (this.webRtcWs === null) {
                return
            }
            this.webRtcWs.close()
            this.webRtcWs = null
        }

        this.webRtcWs.onclose = () => {
            console.log('[webcam-rtspsimpleserver] websocket closed')
            this.webRtcWs = null
            this.webRtcScheduleRestart()
        }

        this.webRtcWs.onmessage = (msg: any) => this.webRtcOnIceServers(msg)
    }

    webRtcTerminate() {
        this.webRtcTerminated = true

        try {
            this.video.pause()
        } catch (err) {
            // ignore -- make sure we close down the sockets anyway
        }

        this.webRtcWs?.close()
        this.webRtcPc?.close()
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

            console.log('[webcam-rtspsimpleserver] peer connection state:', this.webRtcPc.iceConnectionState)

            switch (this.webRtcPc.iceConnectionState) {
                case 'disconnected':
                    this.webRtcScheduleRestart()
            }
        }

        this.webRtcPc.ontrack = (evt: any) => {
            console.log('[webcam-rtspsimpleserver] new track ' + evt.track.kind)
            this.video.srcObject = evt.streams[0]
        }

        const direction = 'sendrecv'
        this.webRtcPc.addTransceiver('video', { direction })
        this.webRtcPc.addTransceiver('audio', { direction })

        this.webRtcPc.createOffer().then((desc: any) => {
            if (this.webRtcPc === null || this.webRtcWs === null) {
                return
            }

            this.webRtcPc.setLocalDescription(desc)

            console.log('[webcam-rtspsimpleserver] sending offer')
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
        this.webRtcWs?.close()
        this.webRtcWs = null

        this.webRtcPc?.close()
        this.webRtcPc = null

        if (this.webRtcTerminated) {
            return
        }

        this.webRtcRestartTimeout = window.setTimeout(() => {
            this.webRtcStart()
        }, 2000)
    }
}
</script>

<style scoped>
.webcamImage {
    width: 100%;
}
</style>
