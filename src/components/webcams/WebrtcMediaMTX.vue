<template>
    <div>
        <video
            v-show="status === 'connected'"
            ref="video"
            :style="webcamStyle"
            class="webcamImage"
            autoplay
            playsinline
            muted />
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
export default class WebrtcRTSPSimpleServer extends Mixins(BaseMixin, WebcamMixin) {
    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null
    @Ref() declare video: HTMLVideoElement

    // webrtc player vars
    private terminated: boolean = false
    private ws: WebSocket | null = null
    private pc: RTCPeerConnection | null = null
    private restartTimeoutTimer: any = null
    private status: string = 'connecting'

    // stop the video and close the streams if the component is going to be destroyed so we don't leave hanging streams
    beforeDestroy() {
        this.terminate()

        // clear any potentially open restart timeout
        if (this.restartTimeoutTimer) {
            clearTimeout(this.restartTimeoutTimer)
        }
    }

    get webcamStyle() {
        return {
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0
            ),
        }
    }

    get url() {
        let baseUrl = this.camSettings.stream_url
        if (baseUrl.startsWith('http')) {
            baseUrl = baseUrl.replace('http', 'ws') + 'ws'
        }

        return this.convertUrl(baseUrl, this.printerUrl)
    }

    // stop and restart the video if the url changes
    @Watch('url')
    changedUrl() {
        this.terminate()
        this.start()
    }

    get expanded(): boolean {
        return this.$store.getters['gui/getPanelExpand']('webcam-panel', this.viewport) ?? false
    }

    // start or stop the video when the expand state changes
    @Watch('expanded', { immediate: true })
    expandChanged(newExpanded: boolean): void {
        if (!newExpanded) {
            this.terminate()
            return
        }

        this.start()
    }

    // webrtc player methods
    // adapated from sample player in https://github.com/mrlt8/docker-wyze-bridge
    start() {
        // unterminate we're starting again.
        this.terminated = false

        // clear any potentially open restart timeout
        if (this.restartTimeoutTimer) {
            clearTimeout(this.restartTimeoutTimer)
            this.restartTimeoutTimer = null
        }

        window.console.log('[webcam-rtspsimpleserver] web socket connecting')

        // test if the url is valid
        try {
            const url = new URL(this.url)

            // break if url protocol is not ws
            if (!url.protocol.startsWith('ws')) {
                console.log('[webcam-rtspsimpleserver] invalid URL (no ws protocol)')
                return
            }
        } catch (err) {
            console.log('[webcam-rtspsimpleserver] invalid URL')
            return
        }

        // open websocket connection
        this.ws = new WebSocket(this.url)

        this.ws.onerror = (event) => {
            window.console.log('[webcam-rtspsimpleserver] websocket error', event)
            this.ws?.close()
            this.ws = null
        }

        this.ws.onclose = (event) => {
            console.log('[webcam-rtspsimpleserver] websocket closed', event)
            this.ws = null
            this.scheduleRestart()
        }

        this.ws.onmessage = (msg: MessageEvent) => this.webRtcOnIceServers(msg)
    }

    terminate() {
        this.terminated = true

        try {
            this.video.pause()
        } catch (err) {
            // ignore -- make sure we close down the sockets anyway
        }

        this.ws?.close()
        this.pc?.close()
    }

    webRtcOnIceServers(msg: MessageEvent) {
        if (this.ws === null) return

        const iceServers = JSON.parse(msg.data)
        this.pc = new RTCPeerConnection({
            iceServers,
        })

        this.ws.onmessage = (msg: MessageEvent) => this.webRtcOnRemoteDescription(msg)
        this.pc.onicecandidate = (evt: RTCPeerConnectionIceEvent) => this.webRtcOnIceCandidate(evt)

        this.pc.oniceconnectionstatechange = () => {
            if (this.pc === null) return

            window.console.log('[webcam-rtspsimpleserver] peer connection state:', this.pc.iceConnectionState)

            this.status = (this.pc?.iceConnectionState ?? '').toString()

            if (['failed', 'disconnected'].includes(this.status)) {
                this.scheduleRestart()
            }
        }

        this.pc.ontrack = (evt: RTCTrackEvent) => {
            window.console.log('[webcam-rtspsimpleserver] new track ' + evt.track.kind)
            this.video.srcObject = evt.streams[0]
        }

        const direction = 'sendrecv'
        this.pc.addTransceiver('video', { direction })
        this.pc.addTransceiver('audio', { direction })

        this.pc.createOffer().then((desc: any) => {
            if (this.pc === null || this.ws === null) return

            this.pc.setLocalDescription(desc)

            window.console.log('[webcam-rtspsimpleserver] sending offer')
            this.ws.send(JSON.stringify(desc))
        })
    }

    webRtcOnRemoteDescription(msg: any) {
        if (this.pc === null || this.ws === null) return

        this.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)))
        this.ws.onmessage = (msg: any) => this.webRtcOnRemoteCandidate(msg)
    }

    webRtcOnIceCandidate(evt: RTCPeerConnectionIceEvent) {
        if (this.ws === null) return

        if (evt.candidate?.candidate !== '') {
            this.ws.send(JSON.stringify(evt.candidate))
        }
    }

    webRtcOnRemoteCandidate(msg: any) {
        if (this.pc === null) return

        this.pc.addIceCandidate(JSON.parse(msg.data))
    }

    scheduleRestart() {
        this.ws?.close()
        this.ws = null

        this.pc?.close()
        this.pc = null

        if (this.terminated) return

        this.restartTimeoutTimer = setTimeout(() => {
            this.start()
        }, 2000)
    }
}
</script>

<style scoped>
.webcamImage {
    width: 100%;
}

._webcam_webrtc_output {
    aspect-ratio: calc(3 / 2);
}

video {
    width: 100%;
}
</style>
