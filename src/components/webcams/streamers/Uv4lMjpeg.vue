<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <img
            ref="image"
            v-observe-visibility="viewportVisibilityChanged"
            :style="webcamStyle"
            class="webcamImage"
            draggable="false"
            :alt="camSettings.name"
            @load="onload" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useWebcam } from '@/composables/useWebcam'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

const props = defineProps({
    camSettings: { type: Object, required: true },
    printerUrl: { default: null },
})

const { convertUrl, getWrapperStyle, generateTransform, updateAspectRatioFromImage } = useWebcam()

const image = ref<HTMLImageElement | null>(null)
const aspectRatio = ref<number | null>(null)
const isVisibleViewport = ref(false)
const isVisibleDocument = ref(true)

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

onMounted(() => {
    document.addEventListener('visibilitychange', documentVisibilityChanged)
})

onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', documentVisibilityChanged)
    stopStream()
})

function startStream() {
    image.value?.setAttribute('src', url.value)
}

function stopStream() {
    if (!image.value) return
    image.value.removeAttribute('src')
    URL.revokeObjectURL(url.value)
}

function documentVisibilityChanged() {
    isVisibleDocument.value = document.visibilityState === 'visible'
    if (!isVisibleDocument.value) stopStream()
    visibilityChanged()
}

function viewportVisibilityChanged(newVal: boolean) {
    isVisibleViewport.value = newVal
    visibilityChanged()
}

function visibilityChanged() {
    if (isVisibleViewport.value && isVisibleDocument.value) {
        startStream()
        return
    }
    stopStream()
}

function onload() {
    if (aspectRatio.value !== null) return
    aspectRatio.value = updateAspectRatioFromImage(image.value)
}

watch(url, () => {
    stopStream()
    startStream()
})
</script>
