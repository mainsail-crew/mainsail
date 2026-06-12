<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video
            ref="video"
            :src="url"
            autoplay
            :style="webcamStyle"
            class="webcamImage"
            @loadedmetadata="onLoadedMetadata" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWebcam } from '@/composables/useWebcam'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

const props = defineProps({
    camSettings: { type: Object, required: true },
    printerUrl: { default: null },
})

const { convertUrl, getWrapperStyle, generateTransform, updateAspectRatioFromVideo } = useWebcam()

const video = ref<HTMLVideoElement | null>(null)
const aspectRatio = ref<number | null>(null)

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

function onLoadedMetadata() {
    aspectRatio.value = updateAspectRatioFromVideo(video.value)
}
</script>
