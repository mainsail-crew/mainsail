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
export default class WebrtcGo2rtc extends Mixins(BaseMixin, WebcamMixin) {
    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null
    @Ref() declare video: HTMLVideoElement

    pc: RTCPeerConnection | null = null
    ws: WebSocket | null = null
    restartPause = 2000
    restartTimeout: any = null
    status: string = 'connecting'

    mounted() {
        this.start()
    }

    // stop the video and close the streams if the component is going to be destroyed so we don't leave hanging streams
    beforeDestroy() {
        this.terminate()

        // clear any potentially open restart timeout
        if (this.restartTimeout) clearTimeout(this.restartTimeout)
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
        let urlSearch = ''
        let url = new URL(location.href)

        try {
            urlSearch = new URL(this.camSettings.stream_url).search.toString()
            url = new URL('api/ws' + urlSearch, this.camSettings.stream_url)
        } catch (e) {
            this.log('invalid url', this.camSettings.stream_url)
        }

        // create media types array
        const media = ['video']
        if (this.enableAudio) media.push('audio')

        url.searchParams.set('media', media.join('+'))
        // change protocol to ws
        url.protocol = this.$store.state.socket.protocol + ':'

        // output a warning, if no src is set in the url
        if (!url.searchParams.has('src')) {
            this.log('no src set in url')
        }

        return this.convertUrl(url.toString(), this.printerUrl)
    }

    get enableAudio() {
        return this.camSettings.extra_data?.enableAudio ?? false
    }

    // stop and restart the video if the url changes
    @Watch('url')
    changedUrl() {
        this.terminate()
        this.start()
    }

    // stop and restart the video if enableAudio changes
    @Watch('enableAudio')
    changedEnableAudio() {
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

    log(msg: string, obj?: any) {
        if (obj) {
            window.console.log(`[WebRTC go2rtc] ${msg}`, obj)
            return
        }

        window.console.log(`[WebRTC go2rtc] ${msg}`)
    }

    // webrtc player methods
    // adapted from https://github.com/AlexxIT/go2rtc/blob/master/www/webrtc.html

    start() {
        if (!this.video) {
            this.scheduleRestart()
            return
        }

        this.log('connecting to ' + this.url)
        this.status = 'connecting'

        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        })

        let localTracks: MediaStreamTrack[] = []
        const kinds = ['video', 'audio']
        kinds.forEach((kind: string) => {
            const track = this.pc?.addTransceiver(kind, { direction: 'recvonly' }).receiver.track
            if (track) localTracks.push(track)
        })
        this.video.srcObject = new MediaStream(localTracks)

        this.ws = new WebSocket(this.url)
        this.ws.addEventListener('open', () => this.onWebSocketOpen())
        this.ws.addEventListener('message', (ev) => this.onWebSocketMessage(ev))
        this.ws.addEventListener('close', (ev) => this.onWebSocketClose(ev))
    }

    onWebSocketOpen() {
        this.log('open')

        if (this.restartTimeout !== null) {
            clearTimeout(this.restartTimeout)
            this.restartTimeout = null
        }

        this.pc?.addEventListener('icecandidate', (ev) => {
            if (!ev.candidate) return
            const msg = { type: 'webrtc/candidate', value: ev.candidate.candidate }
            this.ws?.send(JSON.stringify(msg))
        })

        this.pc?.addEventListener('connectionstatechange', () => {
            this.status = (this.pc?.connectionState ?? '').toString()
            this.log('connection state changed', this.status)

            if (['failed', 'disconnected'].includes(this.status)) {
                this.scheduleRestart()
            }
        })

        this.pc
            ?.createOffer()
            .then((offer) => this.pc?.setLocalDescription(offer))
            .then(() => {
                const msg = { type: 'webrtc/offer', value: this.pc?.localDescription?.sdp }
                this.ws?.send(JSON.stringify(msg))
            })
    }

    onWebSocketMessage(ev: MessageEvent) {
        const msg = JSON.parse(ev.data)

        if (msg.type === 'webrtc/candidate') {
            this.pc?.addIceCandidate({ candidate: msg.value, sdpMid: '0' })
        } else if (msg.type === 'webrtc/answer') {
            this.pc?.setRemoteDescription({ type: 'answer', sdp: msg.value })
        }
    }

    onWebSocketClose(ev: CloseEvent) {
        this.log('close')
        this.status = 'disconnected'

        if (!ev.wasClean) this.scheduleRestart()
    }

    terminate() {
        this.log('terminating')

        if (this.pc !== null) {
            this.pc.close()
            this.pc = null
        }

        if (this.ws !== null) {
            this.ws.close()
            this.ws = null
        }
    }

    scheduleRestart() {
        if (this.restartTimeout !== null) return

        this.terminate()

        this.restartTimeout = window.setTimeout(() => {
            this.restartTimeout = null
            this.start()
        }, this.restartPause)
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
