<template>
    <v-row>
        <v-col class="v-col-12 py-2 d-flex align-center">
            <span>
                <b class="mr-1">{{ $t('Files.CurrentPath') }}:</b>
                <path-navigation
                    :path="currentPath"
                    :base-directory-label="'/gcodes'"
                    :on-segment-click="clickPathNavGoToDirectory" />
            </span>
            <v-spacer />
            <v-tooltip v-if="disk_usage !== null" top>
                <template #activator="{ props }">
                    <span v-bind="props">
                        <b>{{ $t('Files.FreeDisk') }}:</b>
                        {{ formatFilesize(disk_usage.free) }}
                    </span>
                </template>
                <span>
                    {{ $t('Files.Used') }}: {{ formatFilesize(disk_usage.used) }}
                    <br />
                    {{ $t('Files.Free') }}: {{ formatFilesize(disk_usage.free) }}
                    <br />
                    {{ $t('Files.Total') }}: {{ formatFilesize(disk_usage.total) }}
                </span>
            </v-tooltip>
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useGcodeFiles } from '@/composables/useGcodeFiles'
import { formatFilesize } from '@/plugins/helpers'

const { currentPath, setCurrentPath } = useGcodeFiles()

const store = useStore()

const directory = computed(() =>
    store.getters['files/getDirectory']('gcodes' + currentPath.value)
)

const disk_usage = computed(() =>
    directory.value?.disk_usage ?? { used: 0, free: 0, total: 0 }
)

function clickPathNavGoToDirectory(segment: { location: string }) {
    setCurrentPath(segment.location)
}
</script>

<style scoped></style>
