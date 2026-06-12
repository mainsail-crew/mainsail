<template>
    <span>
        <span v-for="({ directoryName, location }, index) in pathSegments" :key="location" class="navigation-container">
            <template v-if="index !== 0">
                <span class="navigation-divider text-disabled">{{ segmentSeparator }}</span>
            </template>
            <template v-if="index !== pathSegments.length - 1">
                <span
                    class="cursor-pointer navigation-segment"
                    tabindex="0"
                    role="button"
                    @click="onSegmentClick({ location })"
                    @keyup.enter="onSegmentClick({ location })">
                    <template v-if="directoryName">{{ directoryName }}</template>
                    <template v-else>{{ baseDirectoryLabel }}</template>
                </span>
            </template>
            <template v-else>
                <span>
                    <template v-if="directoryName">{{ directoryName }}</template>
                    <template v-else>{{ baseDirectoryLabel }}</template>
                </span>
            </template>
        </span>
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface pathSegment {
    directoryName: string
    location: string
}

const props = defineProps({
    path: { type: String, default: false },
    baseDirectoryLabel: { type: String, default: false },
    onSegmentClick: { type: Function, default: false },
})

const segmentSeparator = '/'

const pathSegments = computed(() => {
    const [firstSegment, ...restOfSegments] = (props.path || '').split(segmentSeparator)

    const firstPathSegment = {
        directoryName: firstSegment,
        location: firstSegment,
    }

    return restOfSegments.reduce(
        (allSegments: pathSegment[], currentSegment: string) => {
            const previousSegmentLocation = allSegments[allSegments.length - 1].location
            const location = `${previousSegmentLocation}${segmentSeparator}${currentSegment}`

            const newPathSegment = {
                directoryName: currentSegment,
                location,
            }

            allSegments.push(newPathSegment)
            return allSegments
        },
        [firstPathSegment]
    )
})
</script>

<style scoped>
.navigation-divider {
    padding: 0 2px;
}
.navigation-segment:hover {
    text-decoration: underline;
}
.navigation-container:last-child {
    font-weight: bold;
}
</style>
