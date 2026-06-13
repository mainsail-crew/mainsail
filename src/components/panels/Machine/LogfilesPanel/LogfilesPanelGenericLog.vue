<template>
    <v-col v-if="exists" cols="12" :class="classes">
 <v-btn :href="href" variant="flat" class="d-block w-100 machine-logfiles-panel__log-button" @click="downloadLog">
            <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
            {{ name }}
        </v-btn>
    </v-col>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import type { FileStateFile } from '@/store/files/types'
import { mdiDownload } from '@mdi/js'

const props = defineProps<{
    name: string
}>()

const { apiUrl, klipperState } = useBase()
const store = useStore()

const logfiles = computed(() =>
    store.getters['files/getDirectory']('logs')?.childrens ?? []
)

const filename = computed(() => props.name + '.log')

const exists = computed(() => {
    if (['klippy', 'moonraker'].includes(props.name)) return true
    return logfiles.value.findIndex((log: FileStateFile) => log.filename === filename.value) !== -1
})

const href = computed(() => {
    let path = '/server/files/logs/'
    if (['klippy', 'moonraker'].includes(props.name)) path = '/server/files/'
    return apiUrl.value + path + filename.value
})

const classes = computed(() => {
    return ['pt-0', 'pb-2']
})

function downloadLog(event: MouseEvent) {
    event.preventDefault()
    const target = event.target as HTMLElement | null
    const hrefVal = target?.closest('a')?.href ?? ''
    if (hrefVal) window.open(hrefVal)
}
</script>

<style scoped>
.machine-logfiles-panel__log-button {
    align-items: center;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 4px;
    color: rgb(var(--v-theme-primary));
    display: flex;
    font-weight: 700;
    justify-content: center;
    letter-spacing: 0.08em;
    min-height: 36px;
    text-transform: uppercase;
    width: 100%;
}

:deep(.machine-logfiles-panel__log-button .v-btn__content) {
    gap: 8px;
}

:deep(.machine-logfiles-panel__log-button .v-icon) {
    color: rgb(var(--v-theme-primary));
}
</style>
