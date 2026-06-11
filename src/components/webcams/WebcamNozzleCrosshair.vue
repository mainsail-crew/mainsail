<template>
    <div ref="container" class="crosshair-container">
        <div class="line horizontal" :style="styleLines" />
        <div class="line vertical" :style="styleLines" />
        <div class="circle" :style="styleCircle" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

const props = defineProps({
    webcam: { type: Object, required: true },
})

const container = ref<HTMLDivElement | null>(null)
const clientHeight = ref(0)

let resizeObserver: ResizeObserver | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const w = computed(() => props.webcam as GuiWebcamStateWebcam)

const color = computed(() => w.value.extra_data?.nozzleCrosshairColor ?? '#ff0000')

const styleLines = computed(() => ({
    backgroundColor: color.value,
}))

const styleCircle = computed(() => {
    const nozzleCrosshairSize = w.value.extra_data?.nozzleCrosshairSize ?? 0.1
    const size = clientHeight.value * nozzleCrosshairSize

    return {
        borderColor: color.value,
        width: `${size}px`,
        height: `${size}px`,
        marginLeft: `-${size / 2}px`,
        marginTop: `-${size / 2}px`,
    }
})

function debounce(fn: () => void, time: number) {
    return () => {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => fn(), time)
    }
}

const handleResize = debounce(() => {
    nextTick(() => {
        if (container.value) {
            clientHeight.value = container.value.clientHeight
        }
    })
}, 200)

onMounted(() => {
    handleResize()

    resizeObserver = new ResizeObserver(() => handleResize())
    if (container.value) {
        resizeObserver.observe(container.value)
    }
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
})
</script>

<style scoped>
.crosshair-container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.line {
    position: absolute;
    background-color: #ff0000;
}

.horizontal {
    height: 1px;
    top: 50%;
    left: 0;
    right: 0;
}

.vertical {
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
}

.circle {
    position: absolute;
    border: 1px solid #ff0000;
    border-radius: 50%;
    box-sizing: border-box;
    top: 50%;
    left: 50%;
}
</style>
