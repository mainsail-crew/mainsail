<template>
    <div v-observe-visibility="viewportVisibilityChanged" class="webcamBackground" :style="wrapperStyle">
        <img
            v-show="status === 'connected'"
            ref="image"
            class="webcamImage"
            draggable="false"
            :style="webcamStyle"
            :alt="camSettings.name"
            src="#"
            @error="onError"
            @load="onLoad" />
        <span v-if="status === 'connected' && showFpsCounter" class="webcamFpsOutput">
            {{ $t('Panels.WebcamPanel.FPS') }}: {{ fpsOutput }}
        </span>
        <webcam-nozzle-crosshair v-if="showNozzleCrosshair" :webcam="camSettings" />
        <v-row v-if="status !== 'connected'">
            <v-col class="_webcam_mjpegstreamer_output text-center d-flex flex-column justify-center align-center">
                <v-progress-circular v-if="status === 'connecting'" indeterminate color="primary" class="mb-3" />
                <span class="mt-3">{{ statusMessage }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWebcam } from '@/composables/useWebcam'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamNozzleCrosshair from '@/components/webcams/WebcamNozzleCrosshair.vue'

const props = defineProps({
    camSettings: { type: Object, required: true },
    printerUrl: { default: null },
    showFps: { type: Boolean, default: true },
})

const { t } = useI18n()
const { convertUrl, getWrapperStyle, generateTransform, updateAspectRatioFromImage } = useWebcam()

const image = ref<HTMLImageElement | null>(null)

const isVisibleDocument = ref(true)
const isVisibleViewport = ref(false)
const status = ref('connecting')
const statusMessage = ref('')

let timer: number | null = null
let request_start_time = performance.now()
const request_time_smoothing = 0.2
let request_time = 0

const currentFPS = ref<number | null>(null)
let fpsTimer: number | null = null
const frames = ref(0)

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

const fpsOutput = computed(() => {
    if (currentFPS.value === null) return '--'
    return currentFPS.value < 10 ? '0' + currentFPS.value.toString() : currentFPS.value
})

const showFpsCounter = computed(() => {
    if (!props.showFps) return false
    return !(props.camSettings.extra_data?.hideFps ?? false)
})

const url = computed(() => convertUrl(props.camSettings?.snapshot_url, props.printerUrl))

const isVisible = computed(() => isVisibleDocument.value && isVisibleViewport.value)

const showNozzleCrosshair = computed(() => {
    const nozzleCrosshair = props.camSettings.extra_data?.nozzleCrosshair ?? false
    return nozzleCrosshair && status.value === 'connected'
})

onMounted(() => {
    document.addEventListener('visibilitychange', documentVisibilityChanged)
})

onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', documentVisibilityChanged)
    stopStream()
})

function documentVisibilityChanged() {
    isVisibleDocument.value = document.visibilityState === 'visible'
}

function viewportVisibilityChanged(newVal: boolean) {
    isVisibleViewport.value = newVal
}

watch(isVisible, (newVal) => {
    if (newVal) {
        startStream()
        return
    }
    stopStream()
}, { immediate: true })

watch(() => props.camSettings, () => {
    aspectRatio.value = null
    stopStream()
    status.value = 'connecting'
    startStream()
}, { deep: true })

function refreshFrame() {
    if (!isVisible.value) return

    if (timer !== null) {
        window.clearTimeout(timer)
        timer = null
    }

    const refreshUrl = new URL(url.value)
    refreshUrl.searchParams.append('bypassCache', new Date().getTime().toString())
    if (image.value) {
        image.value.src = refreshUrl.toString()
    }
    request_start_time = performance.now()
}

function onLoad() {
    if (status.value !== 'connected') {
        status.value = 'connected'
        statusMessage.value = ''
    }
    frames.value++

    if (aspectRatio.value === null) {
        aspectRatio.value = updateAspectRatioFromImage(image.value)
    }

    const targetFps = props.camSettings.target_fps || 10
    const target_time = 1000 / targetFps

    const current_request_time = performance.now() - request_start_time
    request_time = request_time * request_time_smoothing + current_request_time * (1 - request_time_smoothing)
    const timeout = Math.max(0, target_time - request_time)

    timer = window.setTimeout(refreshFrame, timeout)
}

function onError() {
    status.value = 'error'
    statusMessage.value = t('Panels.WebcamPanel.ErrorWhileConnecting', { url: url.value }).toString()

    if (timer !== null) return

    timer = window.setTimeout(refreshFrame, 1000)
}

function startStream() {
    if (!isVisible.value) return

    if (status.value !== 'connected') {
        status.value = 'connecting'
        statusMessage.value = t('Panels.WebcamPanel.ConnectingTo', { url: url.value }).toString()
    }

    clearTimers()

    fpsTimer = window.setInterval(() => {
        currentFPS.value = frames.value
        frames.value = 0
    }, 1000)

    refreshFrame()
}

function stopStream() {
    clearTimers()
}

function clearTimers() {
    if (timer) {
        window.clearTimeout(timer)
        timer = null
    }

    if (fpsTimer) {
        window.clearTimeout(fpsTimer)
        fpsTimer = null
        frames.value = 0
    }
}
</script>

<style scoped>
._webcam_mjpegstreamer_output {
    aspect-ratio: calc(3 / 2);
}

.webcamFpsOutput {
    display: inline-block;
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 3px 10px;
    border-top-left-radius: 5px;
    background: rgba(0, 0, 0, 0.8);
}

html.theme--light .webcamFpsOutput {
    background: rgba(255, 255, 255, 0.7);
}
</style>
