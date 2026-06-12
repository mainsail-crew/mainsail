<template>
    <tr
        :key="item.job_id"
        v-longpress:600="showContextMenu"
        :class="cssClasses"
        @contextmenu="showContextMenu($event)"
        @click="detailsDialogBool = true">
        <td class="pr-0">
            <v-checkbox v-ripple :model-value="isSelected" density="compact" hide-details class="pa-0 mr-0" @click.stop="select(!isSelected)" />
        </td>
        <td class="px-0 text-center" style="width: 32px">
            <template v-if="!item.exists">
                <v-icon class="text-disabled">{{ mdiFileCancel }}</v-icon>
            </template>
            <template v-else-if="smallThumbnail && bigThumbnail">
                <v-tooltip location="top">
                    <template #activator="{ props: activatorProps }">
                        <vue-load-image>
                            <template #image>
                                <img
                                :alt="item.filename"
                                :src="smallThumbnail"
                                width="32"
                                height="32"
                                v-bind="activatorProps" />
                            </template>
                            <template #preloader>
                                <v-progress-circular indeterminate color="primary" />
                            </template>
                            <template #error>
                                <v-icon>{{ mdiFile }}</v-icon>
                            </template>
                        </vue-load-image>
                    </template>
                    <span><img :alt="item.filename" :src="bigThumbnail" width="250" /></span>
                </v-tooltip>
            </template>
            <template v-else-if="smallThumbnail">
                <vue-load-image>
                    <template #image>
                        <img :alt="item.filename" :src="smallThumbnail" width="32" height="32" />
                    </template>
                    <template #preloader>
                        <v-progress-circular indeterminate color="primary" />
                    </template>
                    <template #error>
                        <v-icon>{{ mdiFile }}</v-icon>
                    </template>
                </vue-load-image>
            </template>
            <template v-else>
                <v-icon>{{ mdiFile }}</v-icon>
            </template>
        </td>
        <td>{{ item.filename }}</td>
        <td class="text-right text-no-wrap">
            <template v-if="'note' in item && item.note">
                <v-tooltip location="top">
                    <template #activator="{ props: activatorProps }">
                        <v-icon small class="mr-2" v-bind="activatorProps">
                            {{ mdiNoteTextOutline }}
                        </v-icon>
                    </template>
                    <span v-html="item.note.replaceAll('\n', '<br />')" />
                </v-tooltip>
            </template>
            <v-tooltip location="top">
                <template #activator="{ props: activatorProps }">
                    <span v-bind="activatorProps">
                        <v-icon small :color="statusColor" :disabled="!item.exists">
                            {{ statusIcon }}
                        </v-icon>
                    </span>
                </template>
                <span>{{ statusName }}</span>
            </v-tooltip>
        </td>
        <td v-for="col in tableFields" :key="col.value" class="text-no-wrap" v-html="outputValue(col, item)" />
        <!-- Context menu -->
        <v-menu v-model="contextMenuBool" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item @click="detailsDialogBool = true">
                    <v-icon class="mr-1">{{ mdiTextBoxSearch }}</v-icon>
                    {{ $t('History.Details') }}
                </v-list-item>
                <v-list-item v-if="item.note" @click="editNote">
                    <v-icon class="mr-1">{{ mdiNoteEditOutline }}</v-icon>
                    {{ $t('History.EditNote') }}
                </v-list-item>
                <v-list-item v-else @click="createNote">
                    <v-icon class="mr-1">{{ mdiNotePlusOutline }}</v-icon>
                    {{ $t('History.AddNote') }}
                </v-list-item>
                <v-list-item
                    v-if="item.exists && file"
                    :disabled="printerIsPrinting || !klipperReadyForGui"
                    @click="startPrintDialogBool = true">
                    <v-icon class="mr-1">{{ mdiPrinter }}</v-icon>
                    {{ $t('History.Reprint') }}
                </v-list-item>
                <v-list-item v-if="item.exists && isJobQueueAvailable" @click="addToQueue">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item v-if="item.exists && isJobQueueAvailable" @click="addBatchToQueueDialogBool = true">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddBatchToQueue') }}
                </v-list-item>
                <v-list-item class="text-error" @click="deleteJob">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Buttons.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <history-list-panel-details-dialog v-model="detailsDialogBool" :job="item" />
        <history-list-panel-note-dialog v-model="noteDialogBool" :type="noteDialogType" :job="item" />
        <add-batch-to-queue-dialog v-model="addBatchToQueueDialogBool" :show-toast="true" :filename="item.filename" />
        <start-print-dialog
            v-if="item.exists && file"
            v-model="startPrintDialogBool"
            :file="file"
            :current-path="currentPath" />
    </tr>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toast-notification'
import type { LongpressEvent } from '@/directives/longpress'
import HistoryListPanelDetailsDialog from '@/components/dialogs/HistoryListPanelDetailsDialog.vue'
import Panel from '@/components/ui/Panel.vue'
import { useBase } from '@/composables/useBase'
import { useSocket } from '@/composables/useSocket'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import { FileStateFileThumbnail, FileStateGcodefile } from '@/store/files/types'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import {
    mdiCloseThick,
    mdiDelete,
    mdiFile,
    mdiFileCancel,
    mdiNoteEditOutline,
    mdiNotePlusOutline,
    mdiNoteTextOutline,
    mdiPlaylistPlus,
    mdiPrinter,
    mdiTextBoxSearch,
} from '@mdi/js'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'
import {
    convertPrintStatusIcon,
    convertPrintStatusIconColor,
    escapePath,
    formatFilesize,
    formatPrintTime,
} from '@/plugins/helpers'
import { HistoryListPanelCol } from '@/store/server/history/types'
import HistoryListPanelNoteDialog from '@/components/dialogs/HistoryListPanelNoteDialog.vue'
import AddBatchToQueueDialog from '@/components/dialogs/AddBatchToQueueDialog.vue'

const emit = defineEmits<{
    select: [value: boolean]
}>()

const props = defineProps<{
    item: ServerHistoryStateJob
    tableFields: HistoryListPanelCol[]
    isSelected: boolean
}>()

const { printerIsPrinting, klipperReadyForGui, moonrakerComponents, apiUrl, formatDateTime } = useBase()
const socket = useSocket()
const store = useStore()
const { t } = useI18n()
const toast = useToast()

const detailsDialogBool = ref(false)
const contextMenuBool = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const noteDialogBool = ref(false)
const noteDialogType = ref<'create' | 'edit'>('create')
const addBatchToQueueDialogBool = ref(false)
const startPrintDialogBool = ref(false)

const file = computed<FileStateGcodefile | undefined>(
    () => store.getters['files/getFile']('gcodes/' + props.item.filename) ?? undefined
)

const currentPath = computed(() => {
    const lastSlash = props.item.filename.lastIndexOf('/')
    return lastSlash > 0 ? '/' + props.item.filename.slice(0, lastSlash) : ''
})

const smallThumbnail = computed(() => {
    if ((props.item.metadata?.thumbnails?.length ?? 0) < 1) return false

    const thumbnail = props.item.metadata?.thumbnails?.find(
        (thumb) =>
            thumb.width >= thumbnailSmallMin &&
            thumb.width <= thumbnailSmallMax &&
            thumb.height >= thumbnailSmallMin &&
            thumb.height <= thumbnailSmallMax
    )

    return thumbnail ? createThumbnailUrl(thumbnail) : false
})

const bigThumbnail = computed(() => {
    if ((props.item.metadata?.thumbnails?.length ?? 0) < 1) return false

    const thumbnail = props.item.metadata?.thumbnails?.find((thumb) => thumb.width >= thumbnailBigMin)

    return thumbnail ? createThumbnailUrl(thumbnail) : false
})

const statusIcon = computed(() => convertPrintStatusIcon(props.item.status))
const statusColor = computed(() => convertPrintStatusIconColor(props.item.status))
const statusName = computed(() => {
    const key = `History.StatusValues.${props.item.status}`
    if (!t(key, 'en')) return props.item.status.replace(/_/g, ' ')
    return t(key)
})

const cssClasses = computed(() => {
    const output = ['file-list-cursor', 'user-select-none']
    if (!props.item.exists) output.push('text-disabled')
    return output
})

const isJobQueueAvailable = computed(() => moonrakerComponents.value.includes('job_queue'))

function select(newVal: boolean) {
    emit('select', newVal)
}

function showContextMenu(e: MouseEvent | LongpressEvent) {
    e?.preventDefault()
    EventBus.$emit(CLOSE_CONTEXT_MENU)
    contextMenuX.value = e?.clientX || e?.pageX || window.screenX / 2
    contextMenuY.value = e?.clientY || e?.pageY || window.screenY / 2
    contextMenuBool.value = true
}

function closeContextMenu() {
    contextMenuBool.value = false
}

function createNote() {
    noteDialogType.value = 'create'
    noteDialogBool.value = true
}

function editNote() {
    noteDialogType.value = 'edit'
    noteDialogBool.value = true
}

function addToQueue() {
    store.dispatch('server/jobQueue/addToQueue', [props.item.filename])
    toast.info(t('History.AddToQueueSuccessful', { filename: props.item.filename }).toString())
}

function deleteJob() {
    socket.emit(
        'server.history.delete_job',
        { uid: props.item.job_id },
        { action: 'server/history/getDeletedJobs' }
    )
}

function outputValue(col: HistoryListPanelCol, item: ServerHistoryStateJob) {
    const key = col.value
    let value: string | number | null = null
    if (key in item) {
        const raw = item[key as keyof ServerHistoryStateJob]
        if (typeof raw === 'string' || typeof raw === 'number') value = raw
    } else if (key in item.metadata) {
        const raw = item.metadata[key]
        if (typeof raw === 'string' || typeof raw === 'number') value = raw
    }

    if (key.startsWith('history_field_')) {
        const fieldName = key.replace('history_field_', '')
        const field = item.auxiliary_data?.find((field) => field.name === fieldName)
        if (field && !Array.isArray(field.value)) return `${Math.round(field.value * 1000) / 1000} ${field.units}`
    }

    if (value === null) return '--'

    if (key === 'slicer') return `${value}<br />${item.metadata.slicer_version}`

    if (typeof value !== 'number') return value

    switch (col.outputType) {
        case 'filesize':
            return formatFilesize(value)
        case 'date':
            return formatDateTime(value * 1000)
        case 'time':
            return formatPrintTime(value, false)
        case 'temp':
            return value.toFixed() + ' °C'
        case 'length':
            if (value > 1000) return (value / 1000).toFixed(2) + ' m'
            return value.toFixed(2) + ' mm'
        default:
            return value
    }
}

function createThumbnailUrl(thumbnail: FileStateFileThumbnail) {
    let relative_url = ''
    if (props.item.filename.lastIndexOf('/') !== -1) {
        relative_url = props.item.filename.substring(0, props.item.filename.lastIndexOf('/') + 1)
    }
    return `${apiUrl.value}/server/files/gcodes/${escapePath(relative_url + thumbnail.relative_path)}?timestamp=${
        props.item.metadata.modified
    }`
}

onMounted(() => {
    EventBus.$on(CLOSE_CONTEXT_MENU, closeContextMenu)
})

onBeforeUnmount(() => {
    EventBus.$off(CLOSE_CONTEXT_MENU, closeContextMenu)
})
</script>
