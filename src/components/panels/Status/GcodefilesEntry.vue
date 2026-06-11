<template>
    <tr
        v-longpress:600="showContextMenu"
        class="cursor-pointer"
        @contextmenu="showContextMenu($event)"
        @click="showPrintDialog = true">
        <td class="pr-0 text-center" style="width: 32px">
            <gcodefiles-thumbnail :item="item" />
        </td>
        <td class="pr-2">
            <div class="d-block text-truncate" :style="styleContentTdWidth">{{ item.filename }}</div>
            <small v-if="existsMetadata">{{ description }}</small>
        </td>
        <td>
            <v-tooltip v-if="item.last_status" top>
                <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                        <v-icon small :color="statusColor">{{ statusIcon }}</v-icon>
                    </span>
                </template>
                <span>{{ item.last_status.replace(/_/g, ' ') }}</span>
            </v-tooltip>
        </td>
        <v-menu v-model="contextMenuShow" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item :disabled="printerIsPrinting || !klipperReadyForGui" @click="showPrintDialog = true">
                    <v-icon class="mr-1">{{ mdiPlay }}</v-icon>
                    {{ $t('Files.PrintStart') }}
                </v-list-item>
                <v-list-item v-if="moonrakerComponents.includes('job_queue')" @click="addToQueue">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item v-if="moonrakerComponents.includes('job_queue')" @click="showAddBatchToQueueDialog = true">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddBatchToQueue') }}
                </v-list-item>
                <v-list-item
                    v-if="item.preheat_gcode !== null"
                    :disabled="['error', 'printing', 'paused'].includes(printer_state)"
                    @click="doSend(item.preheat_gcode)">
                    <v-icon class="mr-1">{{ mdiFire }}</v-icon>
                    {{ $t('Files.Preheat') }}
                </v-list-item>
                <v-list-item @click="view3D">
                    <v-icon class="mr-1">{{ mdiVideo3d }}</v-icon>
                    {{ $t('Files.View3D') }}
                </v-list-item>
                <v-list-item @click="downloadFile">
                    <v-icon class="mr-1">{{ mdiCloudDownload }}</v-icon>
                    {{ $t('Files.Download') }}
                </v-list-item>
                <v-list-item @click="editFile">
                    <v-icon class="mr-1">{{ mdiFileDocumentEditOutline }}</v-icon>
                    {{ $t('Files.EditFile') }}
                </v-list-item>
                <v-list-item @click="openRenameFileDialog">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Files.Rename') }}
                </v-list-item>
                <v-list-item class="red--text" @click="showDeleteDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Files.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <start-print-dialog v-model="showPrintDialog" :file="item" current-path="" />
        <add-batch-to-queue-dialog v-model="showAddBatchToQueueDialog" :filename="filename" />
        <gcodefiles-rename-file-dialog v-model="showRenameFileDialog" :item="item" />
        <confirmation-dialog
            v-model="showDeleteDialog"
            :title="$t('Files.Delete')"
            :text="$t('Files.DeleteSingleFileQuestion', { name: filename })"
            :action-button-text="$t('Buttons.Delete')"
            @action="removeFile" />
    </tr>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import type { LongpressEvent } from '@/directives/longpress'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import { useSocket } from '@/composables/useSocket'
import { FileStateGcodefile } from '@/store/files/types'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import {
    mdiPlay,
    mdiPlaylistPlus,
    mdiFire,
    mdiVideo3d,
    mdiCloudDownload,
    mdiFileDocumentEditOutline,
    mdiRenameBox,
    mdiDelete,
} from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import AddBatchToQueueDialog from '@/components/dialogs/AddBatchToQueueDialog.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import GcodefilesRenameFileDialog from '@/components/dialogs/GcodefilesRenameFileDialog.vue'
import { convertPrintStatusIcon, convertPrintStatusIconColor, escapePath, formatPrintTime } from '@/plugins/helpers'
import GcodefilesThumbnail from '@/components/panels/Gcodefiles/GcodefilesThumbnail.vue'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'

const props = defineProps<{
    item: FileStateGcodefile
    contentTdWidth: number
}>()

const { printerIsPrinting, klipperReadyForGui, moonrakerComponents, printer_state, apiUrl } = useBase()
const { doSend } = useControl()
const socket = useSocket()
const store = useStore()
const router = useRouter()

const contextMenuShow = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

const showPrintDialog = ref(false)
const showAddBatchToQueueDialog = ref(false)
const showRenameFileDialog = ref(false)
const showDeleteDialog = ref(false)

const styleContentTdWidth = computed(() => `width: ${props.contentTdWidth}px;`)

const existsMetadata = computed(() => props.item?.metadataPulled ?? false)

const description = computed(() => {
    const output = []

    let filament = '--'
    if (props.item.filament_total || props.item.filament_weight_total) {
        filament = ''
        if (props.item.filament_total && props.item.filament_total > 1000)
            filament += `${(props.item.filament_total / 1000).toFixed(2)} m`
        else if (props.item.filament_total) filament += `${props.item.filament_total.toFixed(0)} mm`

        if (props.item.filament_total && props.item.filament_weight_total) filament += ' / '

        if (props.item.filament_weight_total) filament += props.item.filament_weight_total.toFixed(0) + ' g'
    }
    output.push(`Filament: ${filament}`)

    const printTime = props.item.estimated_time ? formatPrintTime(props.item.estimated_time) : '--'
    output.push(`Print Time: ${printTime}`)

    return output.join(', ')
})

const statusIcon = computed(() => convertPrintStatusIcon(props.item.last_status ?? ''))
const statusColor = computed(() => convertPrintStatusIconColor(props.item.last_status ?? ''))

const filename = computed(() =>
    props.item.filename.slice(props.item.filename.lastIndexOf('/') + 1)
)

function showContextMenu(e: MouseEvent | LongpressEvent) {
    e?.preventDefault()
    EventBus.$emit(CLOSE_CONTEXT_MENU)
    contextMenuX.value = e?.clientX || e?.pageX || window.screenX / 2
    contextMenuY.value = e?.clientY || e?.pageY || window.screenY / 2
    contextMenuShow.value = true
}

function closeContextMenu() {
    contextMenuShow.value = false
}

function addToQueue() {
    store.dispatch('server/jobQueue/addToQueue', [props.item.filename])
}

function view3D() {
    router.push({ path: '/viewer', query: { filename: 'gcodes/' + props.item.filename } })
}

function downloadFile() {
    const href = apiUrl.value + '/server/files/gcodes/' + escapePath(props.item.filename)
    window.open(href)
}

function openRenameFileDialog() {
    showRenameFileDialog.value = true
}

function editFile() {
    const pos = props.item.filename.lastIndexOf('/')
    const path = pos > 0 ? props.item.filename.slice(0, pos + 1) : ''
    const fn = pos > 0 ? props.item.filename.slice(pos + 1) : props.item.filename

    store.dispatch('editor/openFile', {
        root: 'gcodes',
        path,
        filename: fn,
        size: props.item.size,
        permissions: props.item.permissions,
    })
}

function removeFile() {
    socket.emit(
        'server.files.delete_file',
        { path: 'gcodes/' + props.item.filename },
        { action: 'files/getDeleteFile' }
    )
}

onMounted(() => {
    EventBus.$on(CLOSE_CONTEXT_MENU, closeContextMenu)
})

onBeforeUnmount(() => {
    EventBus.$off(CLOSE_CONTEXT_MENU, closeContextMenu)
})
</script>
