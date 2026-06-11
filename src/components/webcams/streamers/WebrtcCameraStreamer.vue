<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video
            v-show="status === 'connected'"
            ref="stream"
            class="webcamImage"
            :style="webcamStyle"
            autoplay
            muted
            playsinline
            @loadedmetadata="onLoadedMetadata" />
        <webcam-nozzle-crosshair v-if="nozzleCrosshair" :webcam="camSettings" />
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
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { capitalize } from '@/plugins/helpers'
import WebcamNozzleCrosshair from '@/components/webcams/WebcamNozzleCrosshair.vue'

interface CameraStreamerResponse extends RTCSessionDescriptionInit {
    id: string
    iceServers?: RTCIceServer[]
}

const props = defineProps({
    camSettings: { type: Object, required: true },
    printerUrl: { default: null },
    page: { type: String, default: null },
})

const store = useStore()
const { convertUrl, getWrapperStyle, generateTransform, updateAspectRatioFromVideo, viewport } = useWebcam()

const stream = ref<HTMLVideoElement | null>(null)

let pc: RTCPeerConnection | null = null
const useStun = ref(true)
const aspectRatio = ref<number | null>(null)
const status = ref('connecting')
let restartTimer: number | null = null

const url = computed(() => convertUrl(props.camSettings?.stream_url, props.printerUrl))

const wrapperStyle = computed(() => getWrapperStyle(aspectRatio.value, props.camSettings.rotation))

const webcamStyle = computed(() => ({
    transform: generateTransform(
        props.camSettings.flip_horizontal ?? false,
        props.camSettings.flip_vertical ?? false,
        props.camSettings.rotation ?? 0,
        aspectRatio.value ?? 1
    ),
}))

const nozzleCrosshair = computed(() => props.camSettings.extra_data?.nozzleCrosshair ?? false)

const expanded = computed(() => {
    if (props.page !== 'dashboard') return true
    return store.getters['gui/getPanelExpand']('webcam-panel', viewport.value) ?? false
})

watch(expanded, (newExpanded) => {
    if (!newExpanded) {
        terminate()
        return
    }
    start()
}, { immediate: true })

async function start() {
    if (restartTimer) {
        log('Clearing restart timer before starting stream')
        window.clearTimeout(restartTimer)
    }

    if (!expanded.value) {
        log('Not expanded, not starting stream')
        return
    }

    log(`Requesting ICE servers from ${url.value}`)

    try {
        const requestIceServers = useStun.value ? [{ urls: ['stun:stun.l.google.com:19302'] }] : null
        const response = await fetch(url.value, {
            body: JSON.stringify({ type: 'request', iceServers: requestIceServers, keepAlive: true }),
            method: 'POST',
        })

        if (useStun.value && response.status === 500) {
            const errorMessage = await response.text()
            log('Server returned 500 error, likely due to unsupported ICE server request.')
            log(`Serer error message: ${errorMessage}`)
            useStun.value = false
            restartStream()
            return
        }

        if (response.status !== 200) {
            log(`Failed to start stream: ${response.status}`)
            restartStream()
            return
        }

        const answer = await response.json()
        await onIceServers(answer)
    } catch (e) {
        log('Failed to start stream', e)
    }
}

async function onIceServers(iceResponse: CameraStreamerResponse) {
    if (pc) pc.close()

    const peerConnectionConfig: RTCConfiguration & { sdpSemantics?: string } = {
        iceServers: iceResponse.iceServers ?? [],
        sdpSemantics: 'unified-plan',
    }
    pc = new RTCPeerConnection(peerConnectionConfig)

    pc.addTransceiver('video', { direction: 'recvonly' })

    if ('iceServers' in iceResponse) {
        pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => onIceCandidate(e, iceResponse.id)
    } else {
        log('No ICE servers returned, so the current camera-streamer version may not support them')
    }

    pc.onconnectionstatechange = () => onConnectionStateChange()
    pc.ontrack = (e) => onTrack(e)
    pc.ondatachannel = (e) => onDataChannel(e)

    await pc?.setRemoteDescription(iceResponse)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    const offer = pc.localDescription
    if (!offer) {
        log('Failed to create offer')
        restartStream()
        return
    }

    try {
        const response = await fetch(url.value, {
            body: JSON.stringify({
                type: offer?.type,
                id: iceResponse.id,
                sdp: offer?.sdp,
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
        })
        if (response.status !== 200) {
            log(`Failed to send offer: ${response.status}`)
            restartStream()
        }
    } catch (e) {
        log('Failed to send offer', e)
        restartStream()
    }
}

async function onIceCandidate(e: RTCPeerConnectionIceEvent, id: string) {
    if (!e.candidate) return

    try {
        const response = await fetch(url.value, {
            body: JSON.stringify({
                id,
                type: 'remote_candidate',
                candidates: [e.candidate],
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
        })
        if (response.status !== 200) {
            log(`Failed to send ICE candidate: ${response.status}`)
            restartStream()
        }
    } catch (e) {
        log('Failed to send ICE candidate', e)
        restartStream()
    }
}

function onConnectionStateChange() {
    status.value = pc?.connectionState ?? 'connecting'
    log(`State: ${status.value}`)

    if (['failed', 'disconnected'].includes(status.value)) {
        restartStream(5000)
    }
}

function onTrack(e: RTCTrackEvent) {
    if (e.track.kind !== 'video') return
    if (stream.value) {
        stream.value.srcObject = e.streams[0]
    }
}

function onDataChannel(event: RTCDataChannelEvent) {
    const receiveChannel = event.channel
    log(`Data channel opened: ${receiveChannel.label}`)

    if (receiveChannel.label !== 'keepalive') {
        log(`Unknown data channel label: ${receiveChannel.label}`)
        return
    }

    receiveChannel.onmessage = (message) => {
        if (message.data !== 'ping') return
        receiveChannel.send('pong')
    }
}

function log(msg: string, obj?: unknown) {
    const message = `[WebRTC camera-streamer] ${msg}`
    if (obj) {
        window.console.log(message, obj)
        return
    }
    window.console.log(message)
}

onBeforeUnmount(() => {
    terminate()
    if (restartTimer) window.clearTimeout(restartTimer)
})

function terminate() {
    log('Terminating stream')
    pc?.close()
}

function restartStream(delay = 500) {
    terminate()
    if (restartTimer) return

    restartTimer = window.setTimeout(async () => {
        restartTimer = null
        await start()
    }, delay)
}

function onLoadedMetadata() {
    aspectRatio.value = updateAspectRatioFromVideo(stream.value)
}

watch(url, () => {
    restartStream()
})
</script>

<style scoped>
._webcam_webrtc_output {
    aspect-ratio: calc(3 / 2);
}
</style>
