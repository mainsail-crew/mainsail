<template>
    <v-icon v-if="item.isDirectory">{{ mdiFolder }}</v-icon>
    <v-tooltip
        v-else-if="smallThumbnailUrl"
        location="top"
        content-class="tooltip__content-opacity1"
        :color="bigThumbnailTooltipColor"
        :disabled="!bigThumbnailUrl">
        <template #activator="{ props }">
            <vue-load-image>
                <template #image>
                    <img
                        :src="smallThumbnailUrl"
                        width="32"
                        height="32"
                        :alt="item.filename"
                        v-bind="props" />
                </template>
                <template #preloader>
                    <v-progress-circular indeterminate color="primary" />
                </template>
                <template #error>
                    <v-icon>{{ mdiFile }}</v-icon>
                </template>
            </vue-load-image>
        </template>
        <span>
            <img :src="bigThumbnailUrl" width="250" :alt="item.filename" />
        </span>
    </v-tooltip>
    <v-icon v-else>{{ mdiFile }}</v-icon>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { FileStateGcodefile } from '@/store/files/types'
import { mdiFile, mdiFolder } from '@mdi/js'
import { defaultBigThumbnailBackground, thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import { escapePath } from '@/plugins/helpers'

const props = defineProps<{
    item: FileStateGcodefile
}>()

const store = useStore()
const { apiUrl } = useBase()

const bigThumbnailBackground = computed(() =>
    store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
)

const bigThumbnailTooltipColor = computed(() => {
    if (defaultBigThumbnailBackground.toLowerCase() === bigThumbnailBackground.value.toLowerCase()) {
        return undefined
    }
    return bigThumbnailBackground.value
})

const fileTimestamp = computed(() =>
    typeof props.item.modified.getTime === 'function' ? props.item.modified.getTime() : 0
)

const thumbnails = computed(() => props.item.thumbnails ?? [])

const subdirectory = computed(() => {
    if (!props.item.full_filename.includes('/')) return null
    return escapePath(props.item.full_filename.substring(0, props.item.full_filename.lastIndexOf('/')))
})

const smallThumbnail = computed(() =>
    thumbnails.value.find(
        (thumbnail) =>
            thumbnail.width >= thumbnailSmallMin &&
            thumbnail.width <= thumbnailSmallMax &&
            thumbnail.height >= thumbnailSmallMin &&
            thumbnail.height <= thumbnailSmallMax
    )
)

const smallThumbnailUrl = computed(() => {
    if (smallThumbnail.value === undefined || !('relative_path' in smallThumbnail.value)) return null
    return buildUrl(smallThumbnail.value.relative_path)
})

const bigThumbnail = computed(() =>
    thumbnails.value.find((thumbnail) => thumbnail.width >= thumbnailBigMin)
)

const bigThumbnailUrl = computed(() => {
    if (bigThumbnail.value === undefined || !('relative_path' in bigThumbnail.value)) return null
    return buildUrl(bigThumbnail.value.relative_path)
})

function buildUrl(relativePath: string) {
    const baseArray = [apiUrl.value, 'server/files/gcodes']
    if (subdirectory.value !== null) {
        let sub = subdirectory.value
        if (sub.startsWith('/')) sub = sub.substring(1)
        baseArray.push(sub)
    }
    baseArray.push(escapePath(relativePath))
    const baseUrl = baseArray.join('/')
    return `${baseUrl}?timestamp=${fileTimestamp.value}`
}
</script>
