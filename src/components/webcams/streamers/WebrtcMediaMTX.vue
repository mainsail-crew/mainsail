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

interface OfferData {
    iceUfrag: string
    icePwd: string
    medias: string[]
}

@Component
export default class WebrtcMediaMTX extends Mixins(BaseMixin, WebcamMixin) {
    @Prop({ required: true }) readonly camSettings!: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null
    @Ref() declare video: HTMLVideoElement

    private pc: RTCPeerConnection | null = null
    private restartTimeout: any = null
    private status: string = 'connecting'
    private eTag: string | null = null
    private queuedCandidates: RTCIceCandidate[] = []
    private offerData: OfferData = {
        iceUfrag: '',
        icePwd: '',
        medias: [],
    }
    private RESTART_PAUSE = 2000

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
        let baseUrl = this.camSettings.stream_url
        if (!baseUrl.endsWith('/')) baseUrl += '/'

        baseUrl = new URL('whep', baseUrl).toString()

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

    log(msg: string, obj?: any) {
        if (obj) {
            window.console.log(`[WebRTC mediamtx] ${msg}`, obj)
            return
        }

        window.console.log(`[WebRTC mediamtx] ${msg}`)
    }

    // webrtc player methods
    // adapted from https://github.com/bluenviron/mediamtx/blob/main/internal/core/webrtc_read_index.html

    unquoteCredential = (v: any) => JSON.parse(`"${v}"`)

    // eslint-disable-next-line no-undef
    linkToIceServers(links: string | null): RTCIceServer[] {
        if (links === null) return []

        return links.split(', ').map((link) => {
            const m: RegExpMatchArray | null = link.match(
                /^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i
            )

            // break if match is null
            if (m === null) return { urls: '' }

            // eslint-disable-next-line no-undef
            const ret: RTCIceServer = {
                urls: [m[1]],
            }

            if (m.length > 3) {
                ret.username = this.unquoteCredential(m[3])
                ret.credential = this.unquoteCredential(m[4])
                ret.credentialType = 'password'
            }

            return ret
        })
    }

    parseOffer(offer: string) {
        const ret: OfferData = {
            iceUfrag: '',
            icePwd: '',
            medias: [],
        }

        for (const line of offer.split('\r\n')) {
            if (line.startsWith('m=')) {
                ret.medias.push(line.slice('m='.length))
            } else if (ret.iceUfrag === '' && line.startsWith('a=ice-ufrag:')) {
                ret.iceUfrag = line.slice('a=ice-ufrag:'.length)
            } else if (ret.icePwd === '' && line.startsWith('a=ice-pwd:')) {
                ret.icePwd = line.slice('a=ice-pwd:'.length)
            }
        }

        return ret
    }

    generateSdpFragment(offerData: OfferData, candidates: RTCIceCandidate[]) {
        // I don't found a specification for this, but it seems to be the only way to make it work
        const candidatesByMedia: any = {}
        for (const candidate of candidates) {
            const mid = candidate.sdpMLineIndex
            if (mid === null) continue

            // create the array if it doesn't exist
            if (!(mid in candidatesByMedia)) candidatesByMedia[mid] = []
            candidatesByMedia[mid].push(candidate)
        }

        let frag = 'a=ice-ufrag:' + offerData.iceUfrag + '\r\n' + 'a=ice-pwd:' + offerData.icePwd + '\r\n'
        let mid = 0

        for (const media of offerData.medias) {
            if (candidatesByMedia[mid] !== undefined) {
                frag += 'm=' + media + '\r\n' + 'a=mid:' + mid + '\r\n'

                for (const candidate of candidatesByMedia[mid]) {
                    frag += 'a=' + candidate.candidate + '\r\n'
                }
            }

            mid++
        }

        return frag
    }

    start() {
        this.log('requesting ICE servers from ' + this.url)

        fetch(this.url, {
            method: 'OPTIONS',
        })
            .then((res) => this.onIceServers(res))
            .catch((err) => {
                this.log('error: ' + err)
                this.scheduleRestart()
            })
    }

    onIceServers(res: Response) {
        const iceServers = this.linkToIceServers(res.headers.get('Link'))
        this.log('ice servers:', iceServers)

        this.pc = new RTCPeerConnection({
            iceServers,
        })

        const direction = 'sendrecv'
        this.pc.addTransceiver('video', { direction })
        this.pc.addTransceiver('audio', { direction })

        this.pc.onicecandidate = (evt: RTCPeerConnectionIceEvent) => this.onLocalCandidate(evt)
        this.pc.oniceconnectionstatechange = () => this.onConnectionState()

        this.pc.ontrack = (evt) => {
            this.log('new track:', evt.track.kind)
            this.video.srcObject = evt.streams[0]
        }

        this.pc.createOffer().then((offer) => this.onLocalOffer(offer))
    }

    // eslint-disable-next-line no-undef
    onLocalOffer(offer: RTCSessionDescriptionInit) {
        this.offerData = this.parseOffer(offer.sdp ?? '')
        this.pc?.setLocalDescription(offer)

        fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/sdp',
            },
            body: offer.sdp,
        })
            .then((res) => {
                if (res.status !== 201) throw new Error('bad status code')
                this.eTag = res.headers.get('ETag')

                // fallback for MediaMTX v1.0.x with broken ETag header
                if (res.headers.has('E-Tag')) this.eTag = res.headers.get('E-Tag')

                return res.text()
            })
            .then((sdp) => {
                this.onRemoteAnswer(
                    new RTCSessionDescription({
                        type: 'answer',
                        sdp,
                    })
                )
            })
            .catch((err) => {
                this.log(err)
                this.scheduleRestart()
            })
    }

    onRemoteAnswer(answer: RTCSessionDescription) {
        if (this.restartTimeout !== null) return

        // this.pc.setRemoteDescription(new RTCSessionDescription(answer));
        this.pc?.setRemoteDescription(answer)

        if (this.queuedCandidates.length !== 0) {
            this.sendLocalCandidates(this.queuedCandidates)
            this.queuedCandidates = []
        }
    }

    onConnectionState() {
        if (this.restartTimeout !== null) return

        this.status = this.pc?.iceConnectionState ?? ''
        this.log('peer connection state:', this.status)

        switch (this.status) {
            case 'disconnected':
                this.scheduleRestart()
        }
    }

    onLocalCandidate(evt: RTCPeerConnectionIceEvent) {
        if (this.restartTimeout !== null) return

        if (evt.candidate !== null) {
            if (this.eTag === '') {
                this.queuedCandidates.push(evt.candidate)
                return
            }

            this.sendLocalCandidates([evt.candidate])
        }
    }

    sendLocalCandidates(candidates: RTCIceCandidate[]) {
        fetch(this.url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/trickle-ice-sdpfrag',
                'If-Match': this.eTag,
                // eslint-disable-next-line no-undef
            } as HeadersInit,
            body: this.generateSdpFragment(this.offerData, candidates),
        })
            .then((res) => {
                if (res.status !== 204) throw new Error('bad status code')
            })
            .catch((err) => {
                this.log(err)
                this.scheduleRestart()
            })
    }

    terminate() {
        this.log('terminating')

        if (this.pc !== null) {
            this.pc.close()
            this.pc = null
        }
    }

    scheduleRestart() {
        if (this.restartTimeout !== null) return

        this.terminate()

        this.restartTimeout = window.setTimeout(() => {
            this.log('scheduling restart')
            this.restartTimeout = null
            this.start()
        }, this.RESTART_PAUSE)

        this.eTag = ''
        this.queuedCandidates = []
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
