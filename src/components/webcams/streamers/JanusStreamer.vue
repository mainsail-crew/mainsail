<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video
            v-show="status === 'started'"
            ref="stream"
            class="webcamImage"
            :style="webcamStyle"
            autoplay
            muted
            playsinline
            @loadedmetadata="onLoadedMetadata" />
        <v-row v-if="status !== 'started'">
            <v-col class="_webcam_webrtc_output text-center d-flex flex-column justify-center align-center">
                <v-progress-circular v-if="status === 'connecting'" indeterminate color="primary" class="mb-3" />
                <span class="mt-3">{{ status }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { JanusJs, JanusSession, JanusStreamingPlugin } from 'typed_janus_js'
import type { ConstructorOptions } from 'typed_janus_js/dist/interfaces/janus'
import { useBase } from '@/composables/useBase'
import { useWebcam } from '@/composables/useWebcam'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

const props = defineProps({
    camSettings: { type: Object, required: true },
    printerUrl: { default: null },
})

const { hostUrl } = useBase()
const { getWrapperStyle, generateTransform, updateAspectRatioFromVideo } = useWebcam()

const stream = ref<HTMLVideoElement | null>(null)
let janusClient: JanusJs | null = null
let session: JanusSession | null = null
let handle: JanusStreamingPlugin | null = null
const useStun = ref(false)
const aspectRatio = ref<number | null>(null)
const status = ref('connecting')

const url = computed(() => {
    const baseUrl = props.camSettings.stream_url
    let u = new URL(baseUrl, props.printerUrl === null ? hostUrl.value.toString() : props.printerUrl)
    u.port = '8188'
    u.protocol = props.printerUrl?.startsWith('https') ? 'wss' : 'ws'

    if (baseUrl.startsWith('ws') || baseUrl.startsWith('http')) {
        u = new URL(baseUrl)
        const pathnameParts = u.pathname.split('/')
        u.pathname = pathnameParts.slice(0, pathnameParts.length - 1).join('/')
    }

    return u
})

const wrapperStyle = computed(() => getWrapperStyle(aspectRatio.value, props.camSettings.rotation))

const streamId = computed(() => {
    const pathnameParts = new URL(props.camSettings.stream_url).pathname.split('/')
    return pathnameParts[pathnameParts.length - 1]
})

const webcamStyle = computed(() => ({
    transform: generateTransform(
        props.camSettings.flip_horizontal ?? false,
        props.camSettings.flip_vertical ?? false,
        props.camSettings.rotation ?? 0,
        aspectRatio.value ?? 1
    ),
}))

const streamConfig = computed(() => {
    const config: ConstructorOptions = { server: url.value.toString() }

    if (useStun.value) {
        config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }]
    }

    return config
})

async function startStream() {
    janusClient = new JanusJs(streamConfig.value)
    await janusClient.init({ debug: false })
    session = await janusClient.createSession()
    handle = await session.attach<JanusStreamingPlugin>(JanusStreamingPlugin, {})
    handle?.onMessage.subscribe(async ({ message, jsep }) => {
        if (message?.result?.status) {
            status.value = message.result.status
        }
        if (jsep) {
            const answer = await handle?.createAnswer({ jsep })
            handle?.send({ message: { request: 'start' }, jsep: answer })
        }
    })
    const remoteStream = new MediaStream()
    JanusJs.attachMediaStream(stream.value as HTMLMediaElement, remoteStream)
    handle?.onRemoteTrack.subscribe(({ on, track }) => {
        if (on) remoteStream.addTrack(track)
        else remoteStream.removeTrack(track)
    })
    handle.onIceState.subscribe((value) => {
        console.log(`ICE state changed to ${value}`)
    })
    handle.onError.subscribe((value) => {
        status.value = `errored: ${JSON.stringify(value)}`
    })
    await handle.send({ message: { request: 'watch', id: parseInt(streamId.value!) } })
}

onMounted(() => {
    startStream()
})

function onLoadedMetadata() {
    aspectRatio.value = updateAspectRatioFromVideo(stream.value)
}

onBeforeUnmount(() => {
    session?.destroy({})
})

watch(url, async () => {
    await session?.destroy({})
    await startStream()
})
</script>

<style scoped>
._webcam_webrtc_output {
    aspect-ratio: calc(3 / 2);
}
</style>
