<template>
    <div v-if="bigThumbnailUrl" class="d-flex align-center justify-center min-height-200">
        <v-img
            :src="bigThumbnailUrl"
            :max-width="maxThumbnailWidth"
            class="d-inline-block"
            :style="bigThumbnailStyle" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import type { FileStateGcodefile } from '@/store/files/types'
import { defaultBigThumbnailBackground, thumbnailBigMin } from '@/store/variables'
import { escapePath } from '@/plugins/helpers'

const store = useStore()
const { apiUrl } = useBase()

const props = defineProps({
    file: { type: Object as () => FileStateGcodefile, required: true },
    currentPath: { type: String, default: '' },
})

const bigThumbnailBackground = computed(
    () => store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
)

const bigThumbnailStyle = computed(() => {
    if (defaultBigThumbnailBackground.toLowerCase() === bigThumbnailBackground.value.toLowerCase()) {
        return {}
    }

    return { backgroundColor: bigThumbnailBackground.value }
})

const thumbnails = computed(() => props.file.thumbnails ?? [])

const bigThumbnail = computed(() => thumbnails.value.find((thumbnail) => thumbnail.width >= thumbnailBigMin))

const currentPathWithoutSlash = computed(() => {
    if (props.currentPath.startsWith('/')) return props.currentPath.substring(1)

    return props.currentPath
})

const fileTimestamp = computed(() =>
    typeof props.file.modified.getTime === 'function' ? props.file.modified.getTime() : 0
)

const bigThumbnailUrl = computed(() => {
    if (bigThumbnail.value === undefined || !('relative_path' in bigThumbnail.value)) return null
    const baseArray = [apiUrl.value, 'server/files/gcodes']
    if (currentPathWithoutSlash.value) baseArray.push(escapePath(currentPathWithoutSlash.value))
    baseArray.push(escapePath(bigThumbnail.value.relative_path))
    const baseUrl = baseArray.join('/')

    return `${baseUrl}?timestamp=${fileTimestamp.value}`
})

const maxThumbnailWidth = computed(() => bigThumbnail.value?.width ?? 400)
</script>

<style scoped>
.min-height-200 {
    min-height: 200px;
}
</style>
