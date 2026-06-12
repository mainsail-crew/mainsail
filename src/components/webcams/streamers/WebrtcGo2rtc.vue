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
                <span class="mt-3">{{ status }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useWebcam } from '@/composables/useWebcam'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

const props = defineProps({
    camSettings: { type: Object, required: true },
    printerUrl: { default: null },
})

const store = useStore()
const { convertUrl, getWrapperStyle, generateTransform, updateAspectRatioFromVideo, viewport } = useWebcam()

const video = ref<HTMLVideoElement | null>(null)

let pc: RTCPeerConnection | null = null
let ws: WebSocket | null = null
const restartPause = 2000
let restartTimeout: ReturnType<typeof setTimeout> | null = null
const status = ref('connecting')
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
    let urlSearch = ''
    let u = new URL(location.href)

    try {
        urlSearch = new URL(props.camSettings.stream_url).search.toString()
        u = new URL('api/ws' + urlSearch, props.camSettings.stream_url)
    } catch {
        log('invalid url', props.camSettings.stream_url)
    }

    const media = ['video']
    if (enableAudio.value) media.push('audio')

    u.searchParams.set('media', media.join('+'))
    u.protocol = store.state.socket.protocol + ':'

    if (!u.searchParams.has('src')) {
        log('no src set in url')
    }

    return convertUrl(u.toString(), props.printerUrl)
})

const enableAudio = computed(() => props.camSettings.extra_data?.enableAudio ?? false)

const expanded = computed(() => store.getters['gui/getPanelExpand']('webcam-panel', viewport.value) ?? false)

watch(url, () => {
    terminate()
    start()
})

watch(enableAudio, () => {
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
        window.console.log(`[WebRTC go2rtc] ${msg}`, obj)
        return
    }
    window.console.log(`[WebRTC go2rtc] ${msg}`)
}

function start() {
    if (!video.value) {
        scheduleRestart()
        return
    }

    log('connecting to ' + url.value)
    status.value = 'connecting'

    pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    const localTracks: MediaStreamTrack[] = []
    const kinds = ['video', 'audio']
    kinds.forEach((kind: string) => {
        const track = pc?.addTransceiver(kind, { direction: 'recvonly' }).receiver.track
        if (track) localTracks.push(track)
    })
    video.value.srcObject = new MediaStream(localTracks)

    ws = new WebSocket(url.value)
    ws.addEventListener('open', () => onWebSocketOpen())
    ws.addEventListener('message', (ev) => onWebSocketMessage(ev))
    ws.addEventListener('close', (ev) => onWebSocketClose(ev))
}

function onWebSocketOpen() {
    log('open')

    if (restartTimeout !== null) {
        clearTimeout(restartTimeout)
        restartTimeout = null
    }

    pc?.addEventListener('icecandidate', (ev) => {
        if (!ev.candidate) return
        const msg = { type: 'webrtc/candidate', value: ev.candidate.candidate }
        ws?.send(JSON.stringify(msg))
    })

    pc?.addEventListener('connectionstatechange', () => {
        status.value = (pc?.connectionState ?? '').toString()
        log('connection state changed', status.value)

        if (['failed', 'disconnected'].includes(status.value)) {
            scheduleRestart()
        }
    })

    pc?.createOffer()
        .then((offer) => pc?.setLocalDescription(offer))
        .then(() => {
            const msg = { type: 'webrtc/offer', value: pc?.localDescription?.sdp }
            ws?.send(JSON.stringify(msg))
        })
}

function onWebSocketMessage(ev: MessageEvent) {
    const msg = JSON.parse(ev.data)

    if (msg.type === 'webrtc/candidate') {
        pc?.addIceCandidate({ candidate: msg.value, sdpMid: '0' })
    } else if (msg.type === 'webrtc/answer') {
        pc?.setRemoteDescription({ type: 'answer', sdp: msg.value })
    }
}

function onWebSocketClose(ev: CloseEvent) {
    log('close')
    status.value = 'disconnected'

    if (!ev.wasClean) scheduleRestart()
}

function terminate() {
    log('terminating')

    if (pc !== null) {
        pc.close()
        pc = null
    }

    if (ws !== null) {
        ws.close()
        ws = null
    }
}

function scheduleRestart() {
    if (restartTimeout !== null) return

    terminate()

    restartTimeout = window.setTimeout(() => {
        restartTimeout = null
        start()
    }, restartPause)
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
