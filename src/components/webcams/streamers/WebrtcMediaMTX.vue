<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video
            v-show="status === 'connected'"
            ref="video"
            :style="webcamStyle"
            class="webcamImage"
            autoplay
            playsinline
            muted
            @loadedmetadata="onLoadedMetadata" />
        <v-row v-if="status !== 'connected'">
            <v-col class="_webcam_webrtc_output text-center d-flex flex-column justify-center align-center">
                <v-progress-circular v-if="status === 'connecting'" indeterminate color="primary" class="mb-3" />
                <span class="mt-3">{{ capitalize(status) }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useWebcam } from '@/composables/useWebcam'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { capitalize } from '@/plugins/helpers'

interface OfferData {
    iceUfrag: string
    icePwd: string
    medias: string[]
}

interface RTCIceServerWithCredentialType extends RTCIceServer {
    credentialType?: string
}

const props = defineProps({
    camSettings: { type: Object, required: true },
    printerUrl: { default: null },
    page: { type: String, default: null },
})

const store = useStore()
const { convertUrl, getWrapperStyle, generateTransform, updateAspectRatioFromVideo, viewport } = useWebcam()

const video = ref<HTMLVideoElement | null>(null)

let pc: RTCPeerConnection | null = null
let restartTimeout: ReturnType<typeof setTimeout> | null = null
const status = ref('connecting')
let eTag: string | null = null
let sessionUuid: string | null = null
let queuedCandidates: RTCIceCandidate[] = []
const offerData: OfferData = { iceUfrag: '', icePwd: '', medias: [] }
const RESTART_PAUSE = 2000
const aspectRatio = ref<number | null>(null)

const wrapperStyle = computed(() => getWrapperStyle(aspectRatio.value, props.camSettings.rotation))

const webcamStyle = computed(() => ({
    transform: generateTransform(
        props.camSettings.flip_horizontal ?? false,
        props.camSettings.flip_vertical ?? false,
        props.camSettings.rotation ?? 0,
        aspectRatio.value ?? 1
    ),
}))

const url = computed(() => {
    let baseUrl = props.camSettings.stream_url
    if (!baseUrl.endsWith('/')) baseUrl += '/'
    baseUrl += 'whep'
    return convertUrl(baseUrl, props.printerUrl)
})

const expanded = computed(() => {
    if (props.page !== 'dashboard') return true
    return store.getters['gui/getPanelExpand']('webcam-panel', viewport.value) ?? false
})

watch(url, () => {
    terminate()
    start()
})

watch(expanded, (newExpanded) => {
    if (!newExpanded) {
        terminate()
        return
    }
    start()
}, { immediate: true })

function log(msg: string, obj?: unknown) {
    if (obj) {
        window.console.log(`[WebRTC mediamtx] ${msg}`, obj)
        return
    }
    window.console.log(`[WebRTC mediamtx] ${msg}`)
}

function unquoteCredential(v: string) {
    return JSON.parse(`"${v}"`)
}

function linkToIceServers(links: string | null): RTCIceServer[] {
    if (links === null) return []

    return links.split(', ').map((link) => {
        const m = link.match(
            /^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i
        )

        if (m === null) return { urls: '' }

        const ret: RTCIceServerWithCredentialType = { urls: [m[1]] }

        if (m.length > 3) {
            ret.username = unquoteCredential(m[3])
            ret.credential = unquoteCredential(m[4])
            ret.credentialType = 'password'
        }

        return ret
    })
}

function parseOffer(offer: string) {
    const ret: OfferData = { iceUfrag: '', icePwd: '', medias: [] }

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

function generateSdpFragment(offerData: OfferData, candidates: RTCIceCandidate[]) {
    const candidatesByMedia: Record<number, RTCIceCandidate[]> = {}
    for (const candidate of candidates) {
        const mid = candidate.sdpMLineIndex
        if (mid === null) continue

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

async function start() {
    if (restartTimeout !== null) {
        clearTimeout(restartTimeout)
        restartTimeout = null
    }

    if (url.value === null) {
        log('invalid url')
        scheduleRestart()
        return
    }

    log('requesting ICE servers from ' + url.value)

    try {
        const res = await fetch(url.value, { method: 'OPTIONS' })
        if (res.status !== 204) {
            log('error: Received bad status code:', res.status)
            scheduleRestart()
            return
        }

        await onIceServers(res)
    } catch {
        log('error: Cannot connect to backend')
        scheduleRestart()
    }
}

async function onIceServers(res: Response) {
    const iceServers = linkToIceServers(res.headers.get('Link'))
    log('ice servers:', iceServers)

    pc = new RTCPeerConnection({
        iceServers,
        sdpSemantics: 'unified-plan',
    } as RTCConfiguration & { sdpSemantics?: string })

    const direction = 'sendrecv'
    pc.addTransceiver('video', { direction })
    pc.addTransceiver('audio', { direction })

    pc.onicecandidate = (evt: RTCPeerConnectionIceEvent) => onLocalCandidate(evt)
    pc.oniceconnectionstatechange = () => onConnectionState()

    pc.ontrack = (evt) => {
        log('new track:', evt.track.kind)
        if (video.value) {
            video.value.srcObject = evt.streams[0]
        }
    }

    const offer = await pc.createOffer()
    await onLocalOffer(offer)
}

async function onLocalOffer(offer: RTCSessionDescriptionInit) {
    try {
        const res = await fetch(url.value ?? '', {
            method: 'POST',
            headers: { 'Content-Type': 'application/sdp' },
            body: offer.sdp,
        })

        if (res.status !== 201) {
            log('error: Received bad status code:', res.status)
            scheduleRestart()
            return
        }

        Object.assign(offerData, parseOffer(offer.sdp ?? ''))
        pc?.setLocalDescription(offer)

        eTag = res.headers.get('ETag')
        const location = res.headers.get('Location') ?? ''
        sessionUuid = location?.substring(location.lastIndexOf('/') + 1) ?? null

        // fallback for MediaMTX v1.0.x with broken ETag header
        if (res.headers.has('E-Tag')) eTag = res.headers.get('E-Tag')

        const sdp = await res.text()
        onRemoteAnswer(new RTCSessionDescription({ type: 'answer', sdp }))
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err ?? 'unknown error')
        log(message)
        scheduleRestart()
    }
}

function onRemoteAnswer(answer: RTCSessionDescription) {
    if (restartTimeout !== null) return

    try {
        pc?.setRemoteDescription(answer)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        log(message)
        scheduleRestart()
    }

    if (queuedCandidates.length !== 0) {
        sendLocalCandidates(queuedCandidates)
        queuedCandidates = []
    }
}

function onConnectionState() {
    if (restartTimeout !== null) return

    status.value = pc?.iceConnectionState ?? ''
    log('peer connection state:', status.value)

    switch (status.value) {
        case 'disconnected':
            scheduleRestart()
    }
}

function onLocalCandidate(evt: RTCPeerConnectionIceEvent) {
    if (restartTimeout !== null) return

    if (evt.candidate !== null) {
        if (eTag === '') {
            queuedCandidates.push(evt.candidate)
            return
        }

        sendLocalCandidates([evt.candidate])
    }
}

async function sendLocalCandidates(candidates: RTCIceCandidate[]) {
    if (sessionUuid === null) {
        log('Session-UUID is null')
        scheduleRestart()
        return
    }

    const candidateUrl = (url.value ?? '') + '/' + sessionUuid
    try {
        const res = await fetch(candidateUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/trickle-ice-sdpfrag',
                'If-Match': eTag,
            } as HeadersInit,
            body: generateSdpFragment(offerData, candidates),
        })

        if (res.status === 204) return

        if (res.status === 404) {
            log('stream not found')
            scheduleRestart()
            return
        }

        log(`bad status code ${res.status}`)
        scheduleRestart()
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        log(message)
        scheduleRestart()
    }
}

function terminate() {
    log('terminating')

    if (pc !== null) {
        pc.close()
        pc = null
    }
}

function scheduleRestart() {
    if (restartTimeout !== null) return

    terminate()

    restartTimeout = setTimeout(() => {
        log('scheduling restart')
        restartTimeout = null
        start()
    }, RESTART_PAUSE)

    eTag = ''
    queuedCandidates = []
}

function onLoadedMetadata() {
    aspectRatio.value = updateAspectRatioFromVideo(video.value)
}

onBeforeUnmount(() => {
    terminate()
    if (restartTimeout) clearTimeout(restartTimeout)
})
</script>

<style scoped>
._webcam_webrtc_output {
    aspect-ratio: calc(3 / 2);
}
</style>
