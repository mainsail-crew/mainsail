<template>
    <v-row
        v-longpress:600="openContextMenu"
        class="history-list-entry d-flex flex-row flex-nowrap cursor-pointer"
        @contextmenu="openContextMenu($event)">
        <v-col class="col-auto d-flex flex-column justify-center pr-0 py-0">
            <v-tooltip
                v-if="smallThumbnail"
                top
                :disabled="!bigThumbnail"
                content-class="tooltip__content-opacity1"
                :color="bigThumbnailTooltipColor">
                <template #activator="{ on, attrs }">
                    <vue-load-image class="text-center width-32">
                        <img
                            slot="image"
                            :src="smallThumbnail"
                            :width="32"
                            :height="32"
                            :alt="job.filename"
                            v-bind="attrs"
                            v-on="on" />
                        <div slot="preloader">
                            <v-progress-circular indeterminate color="primary" />
                        </div>
                        <div slot="error">
                            <v-icon>{{ mdiFile }}</v-icon>
                        </div>
                    </vue-load-image>
                </template>
                <span><img :src="bigThumbnail" :width="250" :alt="job.filename" /></span>
            </v-tooltip>
            <v-icon v-else>{{ mdiFile }}</v-icon>
        </v-col>
        <v-col class="py-1" style="min-width: 0; font-size: 0.875em">
            <div class="text-truncate">
                <strong v-if="job.count > 1">{{ job.count }}x</strong>
                {{ job.filename }}
            </div>
            <small v-if="description" class="text-truncate">{{ description }}</small>
        </v-col>
        <v-col class="col-auto d-flex flex-column justify-center pa-0 pr-3">
            <v-tooltip top>
                <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                        <v-icon small :color="statusColor" :disabled="!job.exists">
                            {{ statusIcon }}
                        </v-icon>
                    </span>
                </template>
                <span>{{ statusName }}</span>
            </v-tooltip>
        </v-col>
        <v-menu v-model="showContextMenu" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item
                    v-if="job.exists && file"
                    :disabled="printerIsPrinting || !klipperReadyForGui"
                    @click="startPrintDialogBool = true">
                    <v-icon class="mr-1">{{ mdiPrinter }}</v-icon>
                    {{ $t('History.Reprint') }}
                </v-list-item>
                <v-list-item v-if="job.exists && isJobQueueAvailable" @click="addToQueue">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item v-if="job.exists && isJobQueueAvailable" @click="addBatchToQueueDialogBool = true">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddBatchToQueue') }}
                </v-list-item>
                <v-list-item class="text-error" @click="deleteJob">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Buttons.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <add-batch-to-queue-dialog v-model="addBatchToQueueDialogBool" :show-toast="true" :filename="job.filename" />
        <start-print-dialog
            v-if="job.exists && file"
            v-model="startPrintDialogBool"
            :file="file"
            :current-path="currentPath" />
    </v-row>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toast-notification'
import type { LongpressEvent } from '@/directives/longpress'
import { useBase } from '@/composables/useBase'
import { useSocket } from '@/composables/useSocket'
import { FileStateGcodefile, FileStateFileThumbnail } from '@/store/files/types'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import { mdiCloseThick, mdiDelete, mdiFile, mdiPlaylistPlus, mdiPrinter } from '@mdi/js'
import { defaultBigThumbnailBackground, thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import { ServerHistoryStateJobWithCount } from '@/store/server/history/types'
import { convertPrintStatusIcon, escapePath, formatPrintTime } from '@/plugins/helpers'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'

const props = defineProps<{
    job: ServerHistoryStateJobWithCount
}>()

const { printerIsPrinting, klipperReadyForGui, moonrakerComponents, apiUrl } = useBase()
const socket = useSocket()
const store = useStore()
const { t } = useI18n()
const toast = useToast()

const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

const addBatchToQueueDialogBool = ref(false)
const startPrintDialogBool = ref(false)

const file = computed<FileStateGcodefile | undefined>(
    () => store.getters['files/getFile']('gcodes/' + props.job.filename) ?? undefined
)

const currentPath = computed(() => {
    const lastSlash = props.job.filename.lastIndexOf('/')
    return lastSlash > 0 ? '/' + props.job.filename.slice(0, lastSlash) : ''
})

const smallThumbnail = computed(() => {
    if ((props.job.metadata?.thumbnails?.length ?? 0) < 1) return false

    const thumbnail = props.job.metadata?.thumbnails?.find(
        (thumb) =>
            thumb.width >= thumbnailSmallMin &&
            thumb.width <= thumbnailSmallMax &&
            thumb.height >= thumbnailSmallMin &&
            thumb.height <= thumbnailSmallMax
    )

    return thumbnail ? createThumbnailUrl(thumbnail) : false
})

const bigThumbnail = computed(() => {
    if ((props.job.metadata?.thumbnails?.length ?? 0) < 1) return false

    const thumbnail = props.job.metadata?.thumbnails?.find((thumb) => thumb.width >= thumbnailBigMin)

    return thumbnail ? createThumbnailUrl(thumbnail) : false
})

const statusIcon = computed(() => convertPrintStatusIcon(props.job.status))

const statusColor = computed(() => convertPrintStatusIcon(props.job.status))

const statusName = computed(() => {
    const key = `History.StatusValues.${props.job.status}`
    if (!t(key, 'en')) return props.job.status.replace(/_/g, ' ')
    return t(key)
})

const description = computed(() => {
    const outputArray = []

    const filamentArray = []
    let filament = '--'
    if (filamentLength.value) filamentArray.push(filamentLength.value)
    if (filamentWeight.value) filamentArray.push(filamentWeight.value)
    if (filamentArray.length) filament = filamentArray.join(' / ')
    outputArray.push(`Filament: ${filament}`)

    if (estimatedTime.value !== '--')
        outputArray.push(`Print Time: ${estimatedTime.value}`)
    else if (totalTime.value) outputArray.push(`Total Time: ${totalTime.value}`)

    return outputArray.join(', ')
})

const filamentLength = computed(() => {
    const length = props.job.filament_used
    if (length === 0) return null
    if (length >= 1000) return (length / 1000).toFixed(1) + ' m'
    return length.toFixed(0) + ' mm'
})

const filamentWeight = computed(() => {
    const metadataFilamentLength = props.job.metadata?.filament_total ?? 0
    const metadataFilamentWeight = props.job.metadata?.filament_weight_total ?? 0
    if (metadataFilamentLength === 0 || metadataFilamentWeight === 0) return null

    const specificWeight = metadataFilamentWeight / metadataFilamentLength
    const weight = props.job.filament_used * specificWeight
    if (weight === 0) return null
    if (weight >= 1000) return (weight / 1000).toFixed(1) + ' kg'
    return weight.toFixed(0) + ' g'
})

const estimatedTime = computed(() => {
    const totalSeconds = props.job.print_duration ?? 0
    if (totalSeconds == 0) return '--'
    return formatPrintTime(totalSeconds)
})

const totalTime = computed(() => {
    const totalSeconds = props.job.total_duration ?? 0
    if (totalSeconds === 0) return null
    return formatPrintTime(totalSeconds)
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

const isJobQueueAvailable = computed(() => moonrakerComponents.value.includes('job_queue'))

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

function addToQueue() {
    store.dispatch('server/jobQueue/addToQueue', [props.job.filename])
    toast.info(t('History.AddToQueueSuccessful', { filename: props.job.filename }).toString())
}

function deleteJob() {
    socket.emit(
        'server.history.delete_job',
        { uid: props.job.job_id },
        { action: 'server/history/getDeletedJobs' }
    )
}

function createThumbnailUrl(thumbnail: FileStateFileThumbnail) {
    let relative_url = ''
    if (props.job.filename.lastIndexOf('/') !== -1) {
        relative_url = props.job.filename.substring(0, props.job.filename.lastIndexOf('/') + 1)
    }
    return `${apiUrl.value}/server/files/gcodes/${escapePath(relative_url + thumbnail.relative_path)}?timestamp=${
        props.job.metadata.modified
    }`
}

onMounted(() => {
    EventBus.$on(CLOSE_CONTEXT_MENU, closeContextMenu)
})

onBeforeUnmount(() => {
    EventBus.$off(CLOSE_CONTEXT_MENU, closeContextMenu)
})
</script>

<style scoped>
.width-32 {
    width: 32px;
}
</style>
