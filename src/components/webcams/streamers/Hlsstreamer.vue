<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video
            ref="video"
            v-observe-visibility="visibilityChanged"
            autoplay
            muted
            :style="webcamStyle"
            class="webcamImage"
            @loadedmetadata="onLoadedMetadata" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Hls from 'hls.js'
import { useWebcam } from '@/composables/useWebcam'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

const props = defineProps({
    camSettings: { type: Object, required: true },
    printerUrl: { default: null },
})

const { convertUrl, getWrapperStyle, generateTransform, updateAspectRatioFromVideo } = useWebcam()

const video = ref<HTMLVideoElement | null>(null)
const aspectRatio = ref<number | null>(null)
const isVisible = ref(true)
let hlsInstance: Hls | null = null

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

function visibilityChanged(isVisibleVal: boolean) {
    isVisible.value = isVisibleVal
}

onMounted(() => {
    play()
})

function onLoadedMetadata() {
    aspectRatio.value = updateAspectRatioFromVideo(video.value)
}

function play() {
    if (!video.value) return

    if (Hls.isSupported()) {
        hlsInstance?.destroy()

        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            maxLiveSyncPlaybackRate: 2,
            liveSyncDuration: 0.5,
            liveMaxLatencyDuration: 2,
            backBufferLength: 5,
        })
        hlsInstance.loadSource(url.value)
        hlsInstance.attachMedia(video.value)
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            video.value?.play()
        })
    } else if (video.value.canPlayType('application/vnd.apple.mpegurl')) {
        fetch(url.value).then(() => {
            if (video.value) {
                video.value.src = url.value
                video.value.play()
            }
        })
    }
}

onBeforeUnmount(() => {
    hlsInstance?.destroy()
})
</script>
