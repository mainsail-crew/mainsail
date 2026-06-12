<template>
    <v-row
        v-longpress:600="openContextMenu"
        class="jobqueue-list-entry d-flex flex-row flex-nowrap cursor-pointer"
        @contextmenu="openContextMenu($event)">
        <v-col v-if="showHandle" class="col-auto d-flex flex-column justify-center pr-0 py-0">
            <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
        </v-col>
        <v-col class="col-auto d-flex flex-column justify-center pr-0 py-0">
            <gcodefiles-thumbnail :item="job" />
        </v-col>
        <v-col class="py-1" style="min-width: 0; font-size: 0.875em">
            <div class="text-truncate">
                <strong v-if="job.combinedIds?.length">{{ job.combinedIds.length + 1 }}x</strong>
                {{ job.filename }}
            </div>
            <small v-if="description" class="text-truncate">{{ description }}</small>
        </v-col>
        <v-col
            v-if="showPrintButton && !printerIsPrinting"
            class="col-auto d-flex flex-column justify-center pa-0 pr-1">
            <v-btn icon color="success" class="minwidth-0" @click="startJobqueue">
                <v-icon>{{ mdiPlay }}</v-icon>
            </v-btn>
        </v-col>
        <v-menu v-model="showContextMenu" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item @click="printJob">
                    <v-icon class="mr-1">{{ mdiPlay }}</v-icon>
                    {{ $t('JobQueue.StartPrint') }}
                </v-list-item>
                <v-list-item @click="showChangeCountDialog = true">
                    <v-icon class="mr-1">{{ mdiCounter }}</v-icon>
                    {{ $t('JobQueue.ChangeCount') }}
                </v-list-item>
                <v-list-item @click="removeFromJobqueue">
                    <v-icon class="mr-1">{{ mdiPlaylistRemove }}</v-icon>
                    {{ $t('JobQueue.RemoveFromQueue') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <jobqueue-entry-change-count-dialog v-model="showChangeCountDialog" :job="job" />
    </v-row>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import type { LongpressEvent } from '@/directives/longpress'
import type { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { mdiCloseThick, mdiCounter, mdiDragVertical, mdiFile, mdiPlay, mdiPlaylistRemove } from '@mdi/js'
import { defaultBigThumbnailBackground } from '@/store/variables'
import GcodefilesThumbnail from '@/components/panels/Gcodefiles/GcodefilesThumbnail.vue'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'
import JobqueueEntryChangeCountDialog from '@/components/dialogs/JobqueueEntryChangeCountDialog.vue'

const props = defineProps<{
    job: ServerJobQueueStateJob
    showPrintButton?: boolean
    showHandle?: boolean
}>()

const { printerIsPrinting } = useBase()
const store = useStore()

const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const showChangeCountDialog = ref(false)

const smallThumbnail = computed(() => store.getters['server/jobQueue/getSmallThumbnail'](props.job))
const bigThumbnail = computed(() => store.getters['server/jobQueue/getBigThumbnail'](props.job))

const description = computed(() => {
    if (!props.job?.metadata?.metadataPulled) return false

    const filamentArray: string[] = []
    let filament = '--'
    if (filamentLength.value) filamentArray.push(filamentLength.value)
    if (filamentWeight.value) filamentArray.push(filamentWeight.value)
    if (filamentArray.length) filament = filamentArray.join(' / ')

    let time = '--'
    if (estimatedTime.value) time = estimatedTime.value

    return `Filament: ${filament}, Print Time: ${time}`
})

const filamentLength = computed(() => {
    const length = props.job.metadata?.filament_total ?? 0
    if (length === 0) return null
    if (length >= 1000) return (length / 1000).toFixed(1) + ' m'
    return length.toFixed(0) + ' mm'
})

const filamentWeight = computed(() => {
    const weight = props.job.metadata?.filament_weight_total ?? 0
    if (weight === 0) return null
    if (weight >= 1000) return (length / 1000).toFixed(1) + ' kg'
    return weight.toFixed(0) + ' g'
})

const estimatedTime = computed(() => {
    let totalSeconds = props.job.metadata?.estimated_time ?? 0
    if (totalSeconds == 0) return '--'

    const output: string[] = []

    const days = Math.floor(totalSeconds / (3600 * 24))
    if (days) {
        totalSeconds %= 3600 * 24
        output.push(days + 'd')
    }

    const hours = Math.floor(totalSeconds / 3600)
    totalSeconds %= 3600
    if (hours) output.push(hours + 'h')

    const minutes = Math.floor(totalSeconds / 60)
    if (minutes) output.push(minutes + 'm')

    if (hours > 0) return output.join(' ')

    const seconds = totalSeconds % 60
    if (seconds) output.push(seconds.toFixed(0) + 's')

    return output.join(' ')
})

const bigThumbnailBackground = computed(() =>
    store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
)

const bigThumbnailTooltipColor = computed(() => {
    if (defaultBigThumbnailBackground.toLowerCase() === bigThumbnailBackground.value.toLowerCase()) {
        return undefined
    }
    return bigThumbnailBackground.value
})

function openContextMenu(e: MouseEvent | LongpressEvent) {
    e?.preventDefault()
    EventBus.$emit(CLOSE_CONTEXT_MENU)
    contextMenuX.value = e?.clientX || e?.pageX || window.screenX / 2
    contextMenuY.value = e?.clientY || e?.pageY || window.screenY / 2
    showContextMenu.value = true
}

function closeContextMenu() {
    showContextMenu.value = false
}

function printJob() {
    store.dispatch('server/jobQueue/startByJobId', props.job.job_id)
}

function startJobqueue() {
    store.dispatch('server/jobQueue/start')
}

function removeFromJobqueue() {
    const ids = [...(props.job.combinedIds ?? []), props.job.job_id]
    store.dispatch('server/jobQueue/deleteFromQueue', ids)
}

onMounted(() => {
    EventBus.$on(CLOSE_CONTEXT_MENU, closeContextMenu)
})

onBeforeUnmount(() => {
    EventBus.$off(CLOSE_CONTEXT_MENU, closeContextMenu)
})
</script>
