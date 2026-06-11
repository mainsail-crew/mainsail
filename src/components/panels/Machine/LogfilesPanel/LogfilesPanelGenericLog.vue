<template>
    <v-col v-if="exists" :class="classes">
        <v-btn :href="href" block class="primary--text" @click="downloadLog">
            <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
            {{ name }}
        </v-btn>
    </v-col>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { FileStateFile } from '@/store/files/types'
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
    const output: string[] = ['col-12', 'pt-0']
    if (klipperState.value !== 'ready') {
        output.push('col-md-6')
        output.push('mt-md-3')
    } else {
        output.push('col-md-12')
    }
    return output
})

function downloadLog(event: MouseEvent) {
    event.preventDefault()
    const target = event.target as HTMLElement | null
    const hrefVal = target?.closest('a')?.href ?? ''
    if (hrefVal) window.open(hrefVal)
}
</script>
