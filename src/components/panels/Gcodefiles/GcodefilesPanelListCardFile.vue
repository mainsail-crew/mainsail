<template>
    <v-card
        v-longpress:600="showContextMenuAction"
        class="gcode-card"
        :class="{ 'gcode-card--selected': isSelected }"
        :elevation="isSelected ? 4 : 1"
        @contextmenu="showContextMenuAction($event)">
        <div class="gcode-card__topbar">
            <v-checkbox
                :model-value="isSelected"
                density="compact"
                hide-details
                class="gcode-card__checkbox"
                :ripple="false"
                @click.stop="select(!isSelected)" />
            <v-tooltip v-if="item.last_status" top>
                <template #activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        small
                        class="gcode-card__status"
                        :color="statusIconColor"
                        v-on="on">
                        {{ statusIcon }}
                    </v-icon>
                </template>
                <span>{{ (item.last_status ?? '').replace(/_/g, ' ') }}</span>
            </v-tooltip>
        </div>

        <div class="gcode-card__body">
            <div class="gcode-card__thumb">
                <gcodefiles-thumbnail :item="item" />
            </div>
            <div class="gcode-card__info">
                <div class="gcode-card__name" :title="item.filename">{{ item.filename }}</div>
                <div class="gcode-card__sub">
                    <span class="gcode-card__size">{{ formattedSize }}</span>
                    <span class="gcode-card__sep">·</span>
                    <span>{{ formatDateTime(item.modified) }}</span>
                </div>
                <div class="gcode-card__chips">
                    <v-chip
                        v-if="item.slicer"
                        x-small
                        outlined
                        class="mr-1 gcode-card__chip">
                        {{ item.slicer }}
                    </v-chip>
                    <v-chip
                        v-if="item.count_printed > 0"
                        x-small
                        class="gcode-card__chip gcode-card__chip--runs">
                        {{ item.count_printed }} {{ $t('Files.Runs') }}
                    </v-chip>
                </div>
            </div>
        </div>

        <v-divider class="gcode-card__divider" />

        <div class="gcode-card__stats">
            <div class="gcode-card__stat">
                <div class="gcode-card__stat-label">{{ $t('Files.PrintTime') }}</div>
                <div class="gcode-card__stat-value">{{ secondsOrDash(item.estimated_time) }}</div>
            </div>
            <div class="gcode-card__stat">
                <div class="gcode-card__stat-label">{{ $t('Files.LastPrintDuration') }}</div>
                <div class="gcode-card__stat-value">{{ secondsOrDash(item.last_print_duration) }}</div>
            </div>
            <div class="gcode-card__stat">
                <div class="gcode-card__stat-label">{{ $t('Files.LastTotalDuration') }}</div>
                <div class="gcode-card__stat-value">{{ secondsOrDash(item.last_total_duration) }}</div>
            </div>
            <div class="gcode-card__stat">
                <div class="gcode-card__stat-label">{{ $t('Files.LastStartTime') }}</div>
                <div class="gcode-card__stat-value">{{ dateOrDash(item.last_start_time) }}</div>
            </div>
        </div>

        <template v-if="cncMetadataViewModel">
            <div class="gcode-card__stats gcode-card__stats--cnc">
                <div class="gcode-card__stat">
                    <div class="gcode-card__stat-label">CAM Tool</div>
                    <div class="gcode-card__stat-value">{{ cncMetadataViewModel.camTool }}</div>
                </div>
                <div class="gcode-card__stat">
                    <div class="gcode-card__stat-label">Tool</div>
                    <div class="gcode-card__stat-value">{{ cncMetadataViewModel.tool }}</div>
                </div>
                <div class="gcode-card__stat">
                    <div class="gcode-card__stat-label">Spindle</div>
                    <div class="gcode-card__stat-value">{{ cncMetadataViewModel.spindle }}</div>
                </div>
                <div class="gcode-card__stat">
                    <div class="gcode-card__stat-label">Plunge</div>
                    <div class="gcode-card__stat-value">{{ cncMetadataViewModel.plungeFeed }}</div>
                </div>
                <div class="gcode-card__stat">
                    <div class="gcode-card__stat-label">Cut</div>
                    <div class="gcode-card__stat-value">{{ cncMetadataViewModel.cutFeed }}</div>
                </div>
                <div class="gcode-card__stat">
                    <div class="gcode-card__stat-label">Rapid</div>
                    <div class="gcode-card__stat-value">{{ cncMetadataViewModel.rapidFeed }}</div>
                </div>
            </div>
        </template>

        <v-divider class="gcode-card__divider" />

        <div class="gcode-card__action">
            <v-btn
                block
                small
                color="primary"
                class="gcode-card__start"
                :disabled="!isGcodeFile || !canStart"
                @click.stop="showStartPrintDialog = true">
                <v-icon left small>{{ mdiPlay }}</v-icon>
                {{ $t('Files.PrintStart') }}
            </v-btn>
        </div>

        <v-menu
            v-model="showContextMenu"
            :position-x="showContextMenuX"
            :position-y="showContextMenuY"
            absolute
            offset-y>
            <v-list>
                <v-list-item
                    v-if="isGcodeFile"
                    :disabled="!canStart"
                    @click="showStartPrintDialog = true">
                    <v-icon class="mr-1">{{ mdiPlay }}</v-icon>
                    {{ $t('Files.PrintStart') }}
                </v-list-item>
                <v-list-item
                    v-if="moonrakerComponents.includes('job_queue')"
                    :disabled="!isGcodeFile"
                    @click="addToQueue">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item
                    v-if="moonrakerComponents.includes('job_queue')"
                    :disabled="!isGcodeFile"
                    @click="showAddBatchToQueueDialog = true">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddBatchToQueue') }}
                </v-list-item>
                <v-list-item
                    v-if="item.preheat_gcode !== null"
                    :disabled="!canPreheat"
                    @click="doSend(item.preheat_gcode)">
                    <v-icon class="mr-1">{{ mdiFire }}</v-icon>
                    {{ $t('Files.Preheat') }}
                </v-list-item>
                <v-list-item :disabled="!isGcodeFile" @click="view3D">
                    <v-icon class="mr-1">{{ mdiVideo3d }}</v-icon>
                    {{ $t('Files.View3D') }}
                </v-list-item>
                <v-list-item :disabled="!isGcodeFile" @click="scanMeta">
                    <v-icon class="mr-1">{{ mdiMagnify }}</v-icon>
                    {{ $t('Files.ScanMeta') }}
                </v-list-item>
                <v-list-item @click="downloadFile">
                    <v-icon class="mr-1">{{ mdiCloudDownload }}</v-icon>
                    {{ $t('Files.Download') }}
                </v-list-item>
                <v-list-item :disabled="!isGcodeFile" @click="editFile">
                    <v-icon class="mr-1">{{ mdiFileDocumentEditOutline }}</v-icon>
                    {{ $t('Files.EditFile') }}
                </v-list-item>
                <v-list-item @click="showRenameFileDialog = true">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Files.Rename') }}
                </v-list-item>
                <v-list-item @click="showDuplicateFileDialog = true">
                    <v-icon class="mr-1">{{ mdiContentCopy }}</v-icon>
                    {{ $t('Files.Duplicate') }}
                </v-list-item>
                <v-list-item class="red--text" @click="showDeleteFileDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Files.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>

        <start-print-dialog v-model="showStartPrintDialog" :file="item" :current-path="currentPath" />
        <add-batch-to-queue-dialog v-model="showAddBatchToQueueDialog" :filename="item.full_filename" />
        <gcodefiles-rename-file-dialog v-model="showRenameFileDialog" :item="item" />
        <gcodefiles-duplicate-file-dialog v-model="showDuplicateFileDialog" :item="item" />
        <confirmation-dialog
            v-model="showDeleteFileDialog"
            :title="$t('Files.Delete')"
            :text="$t('Files.DeleteSingleFileQuestion', { name: item.filename })"
            :action-button-text="$t('Buttons.Delete')"
            @action="deleteFile" />
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import type { LongpressEvent } from '@/directives/longpress'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import { useGcodeFiles } from '@/composables/useGcodeFiles'
import { useSocket } from '@/composables/useSocket'
import { FileStateGcodefile } from '@/store/files/types'
import { validGcodeExtensions } from '@/store/variables'
import GcodefilesThumbnail from '@/components/panels/Gcodefiles/GcodefilesThumbnail.vue'
import {
    mdiCloudDownload,
    mdiContentCopy,
    mdiDelete,
    mdiFileDocumentEditOutline,
    mdiFire,
    mdiMagnify,
    mdiPlay,
    mdiPlaylistPlus,
    mdiRenameBox,
    mdiVideo3d,
} from '@mdi/js'
import { convertPrintStatusIcon, convertPrintStatusIconColor, escapePath, formatFilesize, formatPrintTime } from '@/plugins/helpers'
import { buildCncMetadataViewModel, loadCncMetadata, type CncMetadataViewModel } from '@/store/files/cncMetadata'
import GcodefilesRenameFileDialog from '@/components/dialogs/GcodefilesRenameFileDialog.vue'
import GcodefilesDuplicateFileDialog from '@/components/dialogs/GcodefilesDuplicateFileDialog.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import AddBatchToQueueDialog from '@/components/dialogs/AddBatchToQueueDialog.vue'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'

const props = defineProps<{
    item: FileStateGcodefile
    isSelected: boolean
    select: (value: boolean) => void
}>()

const { apiUrl, klipperReadyForGui, printer_state, moonrakerComponents, formatDateTime } = useBase()
const { doSend } = useControl()
const { currentPath, setCurrentPath, selectedFiles, setSelectedFiles } = useGcodeFiles()
const socket = useSocket()
const store = useStore()
const router = useRouter()

const cncMetadataViewModel = ref<CncMetadataViewModel | null>(null)
const cncMetadataLoading = ref(false)
const cncMetadataRequestId = ref(0)

const showContextMenu = ref(false)
const showContextMenuX = ref(0)
const showContextMenuY = ref(0)

const showStartPrintDialog = ref(false)
const showAddBatchToQueueDialog = ref(false)
const showRenameFileDialog = ref(false)
const showDuplicateFileDialog = ref(false)
const showDeleteFileDialog = ref(false)

const isGcodeFile = computed(() => {
    const format = props.item.filename.slice(props.item.filename.lastIndexOf('.'))
    return validGcodeExtensions.includes(format)
})

const canStart = computed(() =>
    klipperReadyForGui.value && !['error', 'printing', 'paused'].includes(printer_state.value)
)

const canPreheat = computed(() =>
    klipperReadyForGui.value && !['error', 'printing', 'paused'].includes(printer_state.value)
)

const formattedSize = computed(() =>
    props.item.size !== undefined ? formatFilesize(props.item.size) : '--'
)

const statusIcon = computed(() =>
    convertPrintStatusIcon(props.item.last_status ?? '')
)

const statusIconColor = computed(() =>
    convertPrintStatusIconColor(props.item.last_status ?? '')
)

function dateOrDash(value: Date | null | undefined): string {
    if (value === null || value === undefined) return '--'
    return formatDateTime(value)
}

function secondsOrDash(value: number | null | undefined): string {
    if (value === null || value === undefined) return '--'
    return formatPrintTime(value)
}

async function refreshCncMetadata() {
    if (!isGcodeFile.value) return
    const requestId = ++cncMetadataRequestId.value
    const filename = props.item.full_filename

    cncMetadataLoading.value = true
    const apiUrlValue = store.getters['socket/getUrl']
    const metadata = await loadCncMetadata(apiUrlValue, filename)

    if (requestId !== cncMetadataRequestId.value) return

    cncMetadataViewModel.value = buildCncMetadataViewModel(metadata)
    cncMetadataLoading.value = false
}

function showContextMenuAction(e: MouseEvent | LongpressEvent) {
    e?.preventDefault()
    EventBus.$emit(CLOSE_CONTEXT_MENU)

    showContextMenuX.value = e?.clientX || e?.pageX || window.screenX / 2
    showContextMenuY.value = e?.clientY || e?.pageY || window.screenY / 2

    showContextMenu.value = true
}

function closeContextMenu() {
    showContextMenu.value = false
}

function addToQueue() {
    let filename = [currentPath.value, props.item.filename].join('/')
    if (filename.startsWith('/')) filename = filename.slice(1)

    store.dispatch('server/jobQueue/addToQueue', [filename])
}

function view3D() {
    router.push({
        path: '/viewer',
        query: { filename: 'gcodes' + currentPath.value + '/' + props.item.filename },
    })
}

function scanMeta() {
    store.dispatch('files/scanMetadata', {
        filename: 'gcodes' + currentPath.value + '/' + props.item.filename,
    })
}

function downloadFile() {
    const filename = currentPath.value + '/' + props.item.filename
    const href = apiUrl.value + '/server/files/gcodes' + escapePath(filename)
    window.open(href)
}

function editFile() {
    store.dispatch('editor/openFile', {
        root: 'gcodes',
        path: currentPath.value,
        filename: props.item.filename,
        size: props.item.size,
        permissions: props.item.permissions,
    })
}

function deleteFile() {
    socket.emit(
        'server.files.delete_file',
        { path: 'gcodes' + currentPath.value + '/' + props.item.filename },
        { action: 'files/getDeleteFile' }
    )
}

onMounted(() => {
    EventBus.$on(CLOSE_CONTEXT_MENU, closeContextMenu)
    void refreshCncMetadata()
})

onBeforeUnmount(() => {
    EventBus.$off(CLOSE_CONTEXT_MENU, closeContextMenu)
})
</script>

<style scoped>
.gcode-card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    background: rgb(var(--v-surface));
    transition: transform 200ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 200ms cubic-bezier(0.25, 1, 0.5, 1),
        border-color 200ms cubic-bezier(0.25, 1, 0.5, 1);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
}

.gcode-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 107, 53, 0.4);
}

.gcode-card--selected {
    border-color: rgb(255, 107, 53);
    background: rgba(255, 107, 53, 0.05);
}

.gcode-card__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px 0 12px;
    min-height: 32px;
}

.gcode-card__checkbox {
    opacity: 0;
    transition: opacity 150ms cubic-bezier(0.25, 1, 0.5, 1);
    margin: 0;
}

.gcode-card:hover .gcode-card__checkbox,
.gcode-card--selected .gcode-card__checkbox {
    opacity: 1;
}

.gcode-card__status {
    margin-left: auto;
}

.gcode-card__body {
    display: flex;
    gap: 12px;
    padding: 12px 12px 12px 12px;
    min-height: 88px;
}

.gcode-card__thumb {
    flex: 0 0 72px;
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 4px;
    overflow: hidden;
}

.gcode-card__info {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.gcode-card__name {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.25;
    color: rgba(255, 255, 255, 0.92);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.gcode-card__sub {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
}

.gcode-card__size {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
}

.gcode-card__sep {
    color: rgba(255, 255, 255, 0.3);
}

.gcode-card__chips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 2px;
}

.gcode-card__chip {
    height: 20px !important;
    font-size: 11px;
}

.gcode-card__chip--runs {
    background: rgba(46, 204, 113, 0.15) !important;
    color: rgb(46, 204, 113) !important;
}

.gcode-card__divider {
    margin: 0;
    border-color: rgba(255, 255, 255, 0.06) !important;
}

.gcode-card__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: rgba(255, 255, 255, 0.04);
    padding: 1px 0;
}

.gcode-card__stat {
    background: rgb(var(--v-surface));
    padding: 8px 12px;
}

.gcode-card__stat-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 2px;
}

.gcode-card__stat-value {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
}

.gcode-card__stats--cnc {
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.gcode-card__action {
    padding: 10px 12px 12px 12px;
}

.gcode-card__start {
    height: 32px !important;
    font-weight: 600;
    letter-spacing: 0.02em;
}
</style>
