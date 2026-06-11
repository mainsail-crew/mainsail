<template>
    <div>
        <panel :title="panelTitle" :icon="mdiVideo3d" card-class="gcode-viewer-panel" :margin-bottom="false">
            <template #buttons>
                <v-btn
                    v-show="reloadRequired"
                    :icon="display.xs"
                    :text="display.smAndUp"
                    tile
                    color="info"
                    class="ml-3"
                    @click="reloadViewer">
                    <span class="d-none d-sm-block">{{ $t('GCodeViewer.ReloadRequired') }}</span>
                    <v-icon class="d-sm-none">{{ mdiReloadAlert }}</v-icon>
                </v-btn>
                <v-btn icon tile @click="resetCamera">
                    <v-icon>{{ mdiCameraRetake }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row :class="showScrubber ? 'withScrubber' : ''">
                    <v-col :cols="showGCode ? 8 : 12">
                        <div ref="viewerCanvasContainer"></div>
                    </v-col>
                    <v-col v-show="showGCode" cols="4">
                        <div class="viewer">
                            <CodeStream
                                ref="gcodestream"
                                :shown="showGCode"
                                :currentline.sync="scrubPosition"
                                :document="fileData"
                                :is-simulating="!printerIsPrinting" />
                        </div>
                    </v-col>
                </v-row>
                <v-row v-show="showScrubber" class="scrubber">
                    <v-col class="pt-0">
                        <v-slider
                            v-model="scrubPosition"
                            :hint="scrubPosition + '/' + scrubFileSize"
                            :max="scrubFileSize"
                            dense
                            min="0"
                            persistent-hint />
                    </v-col>
                    <v-col class="col-auto pt-0 text-center">
                        <v-btn class="px-2 minwidth-0" color="primary" @click="scrubPlaying = !scrubPlaying">
                            <v-icon v-if="scrubPlaying">{{ mdiPause }}</v-icon>
                            <v-icon v-else>{{ mdiPlay }}</v-icon>
                        </v-btn>
                        <v-btn class="px-2 minwidth-0 mx-3" color="primary" @click="fastForward">
                            <v-icon>{{ mdiFastForward }}</v-icon>
                        </v-btn>
                        <v-btn-toggle v-model="scrubSpeed" class="mt-3 mt-sm-0" dense mandatory rounded>
                            <v-btn :value="1">1x</v-btn>
                            <v-btn :value="2">2x</v-btn>
                            <v-btn :value="5">5x</v-btn>
                            <v-btn :value="10">10x</v-btn>
                            <v-btn :value="20">20x</v-btn>
                        </v-btn-toggle>
                    </v-col>
                </v-row>
                <v-row class="mt-0 d-flex align-top">
                    <v-col>
                        <v-row>
                            <v-col
                                order-md="2"
                                class="d-flex align-content-space-around justify-center flex-wrap flex-md-nowrap col-12 col-md-4">
                                <template v-if="loadedFile === null">
                                    <v-btn
                                        v-if="sdCardFilePath !== '' && sdCardFilePath !== loadedFile"
                                        class="mr-3"
                                        @click="loadCurrentFile">
                                        {{ $t('GCodeViewer.LoadCurrentFile') }}
                                    </v-btn>
                                    <v-btn @click="chooseFile">{{ $t('GCodeViewer.LoadLocal') }}</v-btn>
                                </template>
                                <template v-else>
                                    <v-btn v-if="showTrackingButton" class="mr-3" @click="tracking = !tracking">
                                        <v-icon
                                            class="mr-2"
                                            v-html="tracking ? mdiToggleSwitch : mdiToggleSwitchOffOutline" />
                                        {{ $t('GCodeViewer.Tracking') }}
                                    </v-btn>
                                    <v-btn @click="clearLoadedFile">
                                        <v-icon left>{{ mdiBroom }}</v-icon>
                                        {{ $t('GCodeViewer.ClearLoadedFile') }}
                                    </v-btn>
                                </template>
                            </v-col>
                            <v-col class="col-12 col-sm-6 col-md-4">
                                <v-select
                                    v-model="colorMode"
                                    :items="colorModes"
                                    :label="$t('GCodeViewer.ColorMode')"
                                    item-text="text"
                                    dense
                                    hide-details
                                    outlined></v-select>
                            </v-col>
                            <v-col order-md="3" class="col-12 col-sm-6 col-md-4 d-flex">
                                <v-select
                                    v-model="renderQuality"
                                    :items="renderQualities"
                                    :label="$t('GCodeViewer.RenderQuality')"
                                    item-text="label"
                                    dense
                                    hide-details
                                    outlined></v-select>
                                <v-menu
                                    :offset-y="true"
                                    :offset-x="true"
                                    top
                                    :close-on-content-click="false"
                                    :title="$t('Files.SetupCurrentList')">
                                    <template #activator="{ props }">
                                        <v-btn class="minwidth-0 px-2 ml-3" v-bind="props">
                                            <v-icon>{{ mdiCog }}</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="showCursor"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.ShowToolhead')" />
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="showTravelMoves"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.ShowTravelMoves')" />
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="showGCode"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.ShowGCode')" />
                                        </v-list-item>

                                        <v-list-item
                                            v-if="loadedFile === sdCardFilePath && printing_objects.length"
                                            class="minHeight36">
                                            <v-checkbox
                                                v-model="showObjectSelection"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.ShowObjectSelection')" />
                                        </v-list-item>
                                        <v-divider></v-divider>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="hdRendering"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.HDRendering')" />
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="forceLineRendering"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.ForceLineRendering')" />
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="transparency"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.Transparency')" />
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="voxelMode"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.VoxelMode')" />
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="specularLighting"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.SpecularLighting')" />
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="cncMode"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.CNCMode')" />
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <input
                    ref="fileInput"
                    :accept="'.g,.gcode,.gc,.gco,.nc,.ngc,.tap'"
                    hidden
                    multiple
                    type="file"
                    @change="fileSelected" />
            </v-card-text>
        </panel>
        <v-snackbar v-model="loading" :timeout="-1" fixed right bottom>
            <div>
                {{ $t('GCodeViewer.Rendering') }} - {{ loadingPercent }}%
                <br />
                <strong>{{ loadedFile }}</strong>
            </div>
            <v-progress-linear class="mt-2" :value="loadingPercent"></v-progress-linear>
            <template #actions="{ props }">
                <v-btn color="red" text v-bind="props" style="min-width: auto" @click="cancelRendering()">
                    <v-icon class="0">{{ mdiClose }}</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
        <v-snackbar v-model="downloadSnackbar.status" :timeout="-1" fixed right bottom>
            <template v-if="downloadSnackbar.total > 0">
                <div>
                    {{ $t('GCodeViewer.Downloading') }} - {{ Math.round(downloadSnackbar.percent) }} % @
                    {{ formatFilesize(Math.round(downloadSnackbar.speed)) }}/s
                    <br />
                    <strong>{{ downloadSnackbar.filename }}</strong>
                </div>
                <v-progress-linear class="mt-2" :value="downloadSnackbar.percent" />
            </template>
            <template v-else>
                <div>
                    {{ $t('GCodeViewer.Downloading') }}
                    <br />
                    <strong>{{ downloadSnackbar.filename }}</strong>
                </div>
                <v-progress-linear class="mt-2" indeterminate />
            </template>
            <template #actions="{ props }">
                <v-btn color="red" text v-bind="props" style="min-width: auto" @click="cancelDownload">
                    <v-icon class="0">{{ mdiClose }}</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
        <confirmation-dialog
            v-model="excludeObject.bool"
            :title="$t('Panels.StatusPanel.ExcludeObject.ExcludeObjectHeadline')"
            :text="$t('Panels.StatusPanel.ExcludeObject.ExcludeObjectText', { name: excludeObject.name })"
            :action-button-text="$t('Panels.StatusPanel.ExcludeObject.ExcludeObject')"
            action-button-color="primary"
            @action="cancelObject" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'
import GCodeViewer from '@sindarius/gcodeviewer'
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios'
import { escapePath, formatFilesize } from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import CodeStream from '@/components/gcodeviewer/CodeStream.vue'
import debounce from 'lodash.debounce'
import type { GCodeViewerInstance } from '@/store/gcodeviewer/types'
import {
    mdiCameraRetake,
    mdiCog,
    mdiClose,
    mdiReloadAlert,
    mdiToggleSwitch,
    mdiToggleSwitchOffOutline,
    mdiVideo3d,
    mdiPlay,
    mdiPause,
    mdiFastForward,
    mdiBroom,
    mdiSelectionRemove,
} from '@mdi/js'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

interface DownloadSnackbar {
    status: boolean
    filename: string
    percent: number
    speed: number
    total: number
    cancelTokenSource: CancelTokenSource | null
}

interface PrintableObject {
    name: string
    polygon: [number, number][]
}

interface ViewerObjectMetadata {
    cancelled?: boolean
    name?: string
}

const store = useStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const display = useDisplay()
const socket = useSocket()
const { apiUrl, printerIsPrinting, printerIsPrintingOnly } = useBase()

const props = defineProps<{
    filename?: string
}>()

const viewerCanvasContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

let viewer: GCodeViewerInstance | null = null

const isBusy = ref(false)
const loading = ref(false)
const loadingPercent = ref(0)

const tracking = ref(false)
const loadedFile = ref<string | null>(null)

const reloadRequired = ref(false)
const fileSize = ref(0)
const renderQuality = ref(renderQualities.value[2])

const scrubPosition = ref(0)
const scrubPlaying = ref(false)
const scrubSpeed = ref(1)
const scrubInterval = ref<ReturnType<typeof setInterval> | undefined>(undefined)
const scrubFileSize = ref(0)

const downloadSnackbar = ref<DownloadSnackbar>({
    status: false,
    filename: '',
    percent: 0,
    speed: 0,
    total: 0,
    cancelTokenSource: null,
})

const excludeObject = ref({
    bool: false,
    name: '',
})

const fileData = ref('')

const resizeObserver = ref<ResizeObserver | null>(null)

const renderQualities = computed(() => [
    { label: t('GCodeViewer.Low'), value: 2 },
    { label: t('GCodeViewer.Medium'), value: 3 },
    { label: t('GCodeViewer.High'), value: 4 },
    { label: t('GCodeViewer.Ultra'), value: 5 },
    { label: t('GCodeViewer.Max'), value: 6 },
])

onMounted(async () => {
    loadedFile.value = store.state.gcodeviewer?.loadedFileBackup ?? null
    viewer = store.state.gcodeviewer?.viewerBackup ?? null
    await init()

    if (loadedFile.value !== null && viewer) scrubFileSize.value = viewer.fileSize
    if (viewer) fileData.value = viewer.fileData

    resizeObserver.value = new ResizeObserver(() => handleResize())
    resizeObserver.value.observe(viewerCanvasContainer.value!)
})

onBeforeUnmount(() => {
    if (viewer) {
        viewer.gcodeProcessor.loadingProgressCallback = null
        store.dispatch('gcodeviewer/setLoadedFileBackup', loadedFile.value)
        store.dispatch('gcodeviewer/setViewerBackup', viewer)
    }

    scrubPlaying.value = false
    if (scrubInterval.value) {
        clearInterval(scrubInterval.value)
        scrubInterval.value = undefined
    }

    resizeObserver.value?.disconnect()
})

const handleResize = debounce(() => {
    nextTick(() => {
        viewer?.resize()
    })
}, 200)

const panelTitle = computed(() => {
    let title = t('GCodeViewer.Title').toString()

    if (loadedFile.value) title += `: ${loadedFile.value}`

    return title
})

const filePosition = computed(() => (printerIsPrinting.value ? store.state.printer.virtual_sdcard.file_position : 0))

const sdCardFilePath = computed(() => store.state.printer.print_stats?.filename ?? '')

const livePosition = computed(() => store.state.printer.motion_report?.live_position ?? [0, 0, 0, 0])

const gcodeOffset = computed(() => store.state.printer?.gcode_move?.homing_origin ?? [0, 0, 0])

const currentPosition = computed(() => [
    livePosition.value[0] - gcodeOffset.value[0],
    livePosition.value[1] - gcodeOffset.value[1],
    livePosition.value[2] - gcodeOffset.value[2],
    livePosition.value[3],
])

const showTrackingButton = computed(() => printerIsPrinting.value && sdCardFilePath.value === loadedFile.value)

const printing_objects = computed<PrintableObject[]>(() => store.state.printer?.exclude_object?.objects ?? [])

watch(printing_objects, () => {
    refreshPrintingObjects()
})

const excluded_objects = computed(() => store.state.printer.exclude_object?.excluded_objects ?? [])

watch(excluded_objects, () => {
    refreshPrintingObjects()
})

const nozzle_diameter = computed(() => store.state.printer.configfile?.settings?.extruder?.nozzle_diameter ?? 0.4)

async function init() {
    let canvasElement = store.state.gcodeviewer?.canvasBackup ?? null

    if (canvasElement === null) {
        canvasElement = document.createElement('canvas')
        canvasElement.className = 'viewer'
        viewerCanvasContainer.value!.appendChild(canvasElement)
        await store.dispatch('gcodeviewer/setCanvasBackup', canvasElement)
    } else {
        viewerCanvasContainer.value!.appendChild(canvasElement)
        if (viewer?.gcodeProcessor) {
            viewer.gcodeProcessor.updateFilePosition(viewer?.fileSize)
        }
    }

    if (viewer === null) await viewerInit(canvasElement)

    registerProgressCallback()

    if (route.query?.filename && loadedFile.value !== route.query?.filename?.toString()) {
        await sleep(1000)
        await loadFile(route.query.filename.toString())
    }
}

async function viewerInit(element: HTMLCanvasElement) {
    viewer = new GCodeViewer(element)
    await viewer.init()
    viewer.setBackgroundColor(backgroundColor.value)
    viewer.bed.setBedColor(gridColor.value)
    viewer.setCursorVisiblity(showCursor.value)
    viewer.setZClipPlane(1000000, -1000000)
    viewer.axes.show(showAxes.value)
    viewer.bed.setDelta(kinematics.value.includes('delta'))

    if (bedMaxSize.value !== null) {
        viewer.bed.buildVolume.x.max = bedMaxSize.value[0]
        viewer.bed.buildVolume.y.max = bedMaxSize.value[1]
        viewer.bed.buildVolume.z.max = bedMaxSize.value[2]
    }

    if (bedMinSize.value !== null) {
        viewer.bed.buildVolume.x.min = bedMinSize.value[0]
        viewer.bed.buildVolume.y.min = bedMinSize.value[1]
        viewer.bed.buildVolume.z.min = bedMinSize.value[2]
    }

    viewer.gcodeProcessor.useHighQualityExtrusion(hdRendering.value)
    viewer.gcodeProcessor.updateForceWireMode(forceLineRendering.value || cncMode.value)
    viewer.gcodeProcessor.setAlpha(transparency.value)
    viewer.gcodeProcessor.setVoxelMode(voxelMode.value)
    viewer.gcodeProcessor.voxelWidth = voxelWidth.value
    viewer.gcodeProcessor.voxelHeight = voxelHeight.value
    viewer.gcodeProcessor.useSpecularColor(specularLighting.value)
    viewer.gcodeProcessor.setLiveTracking(false)
    viewer.gcodeProcessor.g1AsExtrusion = cncMode.value
    viewer.buildObjects.objectCallback = objectCallback

    loadToolColors(extruderColors.value)

    if (viewer.lastLoadFailed()) {
        renderQuality.value = renderQualities.value[0]
        viewer.updateRenderQuality(1)
        viewer.clearLoadFlag()
    }
}

function registerProgressCallback() {
    if (viewer === null) return

    viewer.gcodeProcessor.loadingProgressCallback = (progress: number) => {
        loadingPercent.value = Math.ceil(progress * 100)
        loading.value = loadingPercent.value <= 99
    }
}

async function cancelRendering() {
    if (viewer === null) return

    viewer.gcodeProcessor.cancelLoad = true
    await sleep(1000)
}

function clearLoadedFile() {
    if (viewer === null) return

    scrubPlaying.value = false
    scrubFileSize.value = 0
    viewer.clearScene(true)
    loadedFile.value = null
    tracking.value = false
}

function chooseFile() {
    if (isBusy.value) return

    fileInput.value?.click()
}

function finishLoad() {
    loading.value = false
    if (viewer === null) return

    viewer.setCursorVisiblity(showCursor.value)

    refreshPrintingObjects()
    scrubFileSize.value = viewer.fileSize

    viewer.gcodeProcessor.updateFilePosition(viewer.fileSize)
}

function refreshPrintingObjects() {
    if (loadedFile.value !== sdCardFilePath.value || printing_objects.value.length === 0) return

    const objects: {
        cancelled: boolean
        name: string
        x: number[]
        y: number[]
    }[] = []
    printing_objects.value.forEach((object) => {
        const xValues = object.polygon.map((point) => point[0])
        const yValues = object.polygon.map((point) => point[1])

        objects.push({
            cancelled: excluded_objects.value.includes(object.name),
            name: object.name,
            x: [Math.min(...xValues), Math.max(...xValues)],
            y: [Math.min(...yValues), Math.max(...yValues)],
        })
    })

    viewer?.buildObjects.loadObjectBoundaries(objects)
    viewer?.buildObjects.showObjectSelection(showObjectSelection.value)
}

async function fileSelected(e: Event) {
    const input = e.target as HTMLInputElement | null
    if (input === null || viewer === null) return

    const reader = new FileReader()
    reader.addEventListener('load', async (event: ProgressEvent<FileReader>) => {
        const blob = event.target?.result
        if (typeof blob === 'string') {
            fileSize.value = blob.length
            await viewer?.processFile(blob)
            fileData.value = viewer?.fileData ?? ''
        }
        finishLoad()
    })
    tracking.value = false

    const selectedFile = input.files?.[0]
    if (selectedFile) {
        loadedFile.value = selectedFile.name
        reader.readAsText(selectedFile)
    }
    input.value = ''
}

async function loadFile(filename: string) {
    downloadSnackbar.value.status = true
    downloadSnackbar.value.speed = 0
    downloadSnackbar.value.filename = filename.startsWith('gcodes/') ? filename.slice(7) : filename
    const CancelToken = axios.CancelToken
    const cancelTokenSource = CancelToken.source()
    downloadSnackbar.value.cancelTokenSource = cancelTokenSource

    const text = await axios
        .get(apiUrl.value + '/server/files/' + escapePath(filename), {
            cancelToken: cancelTokenSource.token,
            responseType: 'blob',
            onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
                downloadSnackbar.value.percent = (progressEvent.progress ?? 0) * 100
                downloadSnackbar.value.speed = progressEvent.rate ?? 0
                downloadSnackbar.value.total = progressEvent.total ?? 0
            },
        })
        .then((res) => res.data.text())
        .catch((e) => {
            window.console.error(e.message)
        })
    downloadSnackbar.value.status = false
    loadedFile.value = downloadSnackbar.value.filename

    if (viewer === null) return

    viewer.updateRenderQuality(renderQuality.value.value)
    await viewer.processFile(text)
    fileData.value = viewer.fileData
    loadingPercent.value = 100
    finishLoad()
    scrubFileSize.value = viewer.fileSize
}

function cancelDownload() {
    downloadSnackbar.value.cancelTokenSource?.cancel('User canceled download gcode file')
}

async function sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms))
}

async function loadCurrentFile() {
    await loadFile('gcodes/' + sdCardFilePath.value)
    loadedFile.value = sdCardFilePath.value
}

async function reloadViewer() {
    if (loadedFile.value === null || viewer === null) return

    if (loading.value) {
        viewer.gcodeProcessor.cancelLoad = true
        await sleep(1000)
    }

    reloadRequired.value = false
    loading.value = true
    loadingPercent.value = 0
    await viewer.reload()
    fileData.value = viewer.fileData
    loadingPercent.value = 100
    finishLoad()
}

function resetCamera() {
    viewer?.resetCamera()
}

function setReloadRequiredFlag() {
    if (loadedFile.value && loadedFile.value != '') {
        reloadRequired.value = true
    }
}

watch(renderQuality, async (newVal: { value: number }) => {
    if (viewer && viewer.renderQuality !== newVal.value) {
        viewer.updateRenderQuality(newVal.value)
        await reloadViewer()
    }
})

watch(currentPosition, (newVal: number[]) => {
    if (!viewer || !tracking.value || scrubPlaying.value) return

    const position = [
        { axes: 'X', position: newVal[0] },
        { axes: 'Y', position: newVal[1] },
        { axes: 'Z', position: newVal[2] },
    ]

    viewer.updateToolPosition(position)
})

watch(filePosition, (newVal: number) => {
    if (!viewer || !tracking.value || scrubPlaying.value) return

    const offset = 350
    if (newVal > 0 && printerIsPrinting.value && tracking.value && newVal > offset) {
        viewer.gcodeProcessor.updateFilePosition(newVal - offset)
        scrubPosition.value = newVal - offset
        return
    }

    viewer.gcodeProcessor.updateFilePosition(viewer.fileSize)
})

watch(tracking, async (newVal: boolean) => {
    if (viewer === null) return

    if (newVal) {
        scrubPlaying.value = false
        viewer.gcodeProcessor.updateFilePosition(0)
        viewer?.forceRender()
        return
    }

    viewer.gcodeProcessor.setLiveTracking(false)
    await reloadViewer()
})

watch(printerIsPrinting, () => {
    tracking.value = false
})

const showCursor = computed({
    get: () => store.state.gui.gcodeViewer.showCursor ?? false,
    set: (newVal: boolean) => { store.dispatch('gui/saveSetting', { name: 'gcodeViewer.showCursor', value: newVal }) },
})

watch(showCursor, (newVal: boolean) => {
    viewer?.setCursorVisiblity(newVal)
})

const showTravelMoves = computed({
    get: () => store.state.gui.gcodeViewer.showTravelMoves ?? false,
    set: (newVal: boolean) => { store.dispatch('gui/saveSetting', { name: 'gcodeViewer.showTravelMoves', value: newVal }) },
})

const showGCode = computed({
    get: () => store.state.gui.gcodeViewer.showGCode ?? false,
    set: (newVal: boolean) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.showGCode', value: newVal })
        if (newVal && viewer) {
            fileData.value = viewer.fileData
        }
        handleResize()
    },
})

watch(showTravelMoves, (newVal: boolean) => {
    viewer?.toggleTravels(newVal)
})

const showObjectSelection = computed({
    get: () => store.state.gui.gcodeViewer.showObjectSelection ?? false,
    set: (newVal: boolean) => { store.dispatch('gui/saveSetting', { name: 'gcodeViewer.showObjectSelection', value: newVal }) },
})

watch(showObjectSelection, (newVal: boolean) => {
    viewer?.buildObjects.showObjectSelection(newVal)
})

const hdRendering = computed({
    get: () => store.state.gui.gcodeViewer.hdRendering,
    set: (newVal) => { store.dispatch('gui/saveSetting', { name: 'gcodeViewer.hdRendering', value: newVal }) },
})

watch(hdRendering, async (newVal: boolean) => {
    if (viewer === null) return

    viewer.gcodeProcessor.useHighQualityExtrusion(newVal)
    await reloadViewer()
})

const forceLineRendering = computed({
    get: () => store.state.gui.gcodeViewer.forceLineRendering,
    set: (newVal) => { store.dispatch('gui/saveSetting', { name: 'gcodeViewer.forceLineRendering', value: newVal }) },
})

watch(forceLineRendering, async (newVal: boolean) => {
    if (viewer === null) return

    viewer.gcodeProcessor.updateForceWireMode(newVal || cncMode.value)
    await reloadViewer()
})

const transparency = computed({
    get: () => store.state.gui.gcodeViewer.transparency,
    set: (newVal) => { store.dispatch('gui/saveSetting', { name: 'gcodeViewer.transparency', value: newVal }) },
})

watch(transparency, async (newVal: boolean) => {
    if (viewer === null) return

    viewer.gcodeProcessor.setAlpha(newVal)
    await reloadViewer()
})

const voxelMode = computed({
    get: () => store.state.gui.gcodeViewer.voxelMode,
    set: (newVal) => { store.dispatch('gui/saveSetting', { name: 'gcodeViewer.voxelMode', value: newVal }) },
})

watch(voxelMode, async (newVal: boolean) => {
    if (viewer === null) return

    viewer.gcodeProcessor.setVoxelMode(newVal)
    viewer.gcodeProcessor.voxelWidth = voxelWidth.value
    viewer.gcodeProcessor.voxelHeight = voxelHeight.value
    await reloadViewer()
})

const voxelWidth = computed({
    get: () => store.state.gui.gcodeViewer.voxelWidth ?? 1,
    set: (newVal) => { store.dispatch('gui/saveSetting', { name: 'gcodeViewer.voxelWidth', value: newVal }) },
})

const voxelHeight = computed({
    get: () => store.state.gui.gcodeViewer.voxelHeight ?? 1,
    set: (newVal) => { store.dispatch('gui/saveSetting', { name: 'gcodeViewer.voxelHeight', value: newVal }) },
})

const specularLighting = computed({
    get: () => store.state.gui.gcodeViewer.specularLighting,
    set: (newVal) => { store.dispatch('gui/saveSetting', { name: 'gcodeViewer.specularLighting', value: newVal }) },
})

watch(specularLighting, async (newVal: boolean) => {
    if (viewer === null) return

    viewer.gcodeProcessor.useSpecularColor(newVal)
})

const cncMode = computed({
    get: () => store.state.gui.gcodeViewer.cncMode,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.cncMode', value: newVal })
        if (viewer === null) return

        viewer.gcodeProcessor.g1AsExtrusion = newVal
        viewer.gcodeProcessor.updateForceWireMode(forceLineRendering.value || newVal)
        reloadViewer()
    },
})

const extruderColors = computed(() => store.state.gui.gcodeViewer?.extruderColors ?? false)

function loadToolColors(colors: string[]) {
    if (!viewer || colors.length === 0) return

    viewer?.gcodeProcessor.resetTools()
    colors.forEach((color: string) => {
        viewer?.gcodeProcessor.addTool(color, nozzle_diameter.value)
    })
    setReloadRequiredFlag()
}

watch(extruderColors, (newVal: string[]) => {
    if (viewer && newVal && newVal.length) {
        loadToolColors(newVal)
        setReloadRequiredFlag()
    }
})

const colorModes = [
    { text: 'Extruder', value: 0 },
    { text: 'Feed Rate', value: 1 },
    { text: 'Feature', value: 2 },
]

const colorMode = computed({
    get: () => store.state.gui.gcodeViewer?.colorMode ?? 2,
    set: (newVal: number) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.colorMode', value: newVal })

        if (viewer && viewer.gcodeProcessor.colorMode !== newVal) {
            viewer.gcodeProcessor.setColorMode(newVal)
            reloadViewer()
        }
    },
})

const backgroundColor = computed(() => store.state.gui.gcodeViewer?.backgroundColor ?? '#121212')

watch(backgroundColor, (newVal: string) => {
    if (viewer === null) return

    viewer.setBackgroundColor(newVal)
})

const gridColor = computed(() => store.state.gui.gcodeViewer?.gridColor ?? '#B3B3B3')

watch(gridColor, (newVal: string) => {
    if (viewer === null) return
    viewer.bed.setBedColor(newVal)
})

const showAxes = computed(() => store.state.gui.gcodeViewer?.showAxes ?? true)

watch(showAxes, (newVal: boolean) => {
    if (viewer === null) return

    viewer.axes.show(newVal)
})

const minFeed = computed(() => store.state.gui.gcodeViewer?.minFeed ?? 20)

watch(minFeed, (newVal: number) => {
    if (viewer === null) return

    viewer.gcodeProcessor.updateColorRate(newVal * 60, maxFeed.value * 60)
})

const maxFeed = computed(() => store.state.gui.gcodeViewer?.maxFeed ?? 100)

watch(maxFeed, (newVal: number) => {
    if (viewer === null) return

    viewer.gcodeProcessor.updateColorRate(minFeed.value * 60, newVal * 60)
})

const minFeedColor = computed(() => store.state.gui.gcodeViewer?.minFeedColor ?? '#0000FF')

watch(minFeedColor, (newVal: string) => {
    if (viewer === null) return

    viewer.gcodeProcessor.updateMinFeedColor(newVal)
    setReloadRequiredFlag()
})

const maxFeedColor = computed(() => store.state.gui.gcodeViewer?.maxFeedColor ?? '#FF0000')

watch(maxFeedColor, (newVal: string) => {
    if (viewer === null) return

    viewer.gcodeProcessor.updateMaxFeedColor(newVal)
    setReloadRequiredFlag()
})

const kinematics = computed(() =>
    store.state.printer.configfile?.settings?.printer?.kinematics ??
    store.state.gui?.gcodeViewer?.klipperCache?.kinematics ??
    ''
)

const bedMaxSize = computed(() =>
    store.state.printer.toolhead?.axis_maximum ??
    store.state.gui?.gcodeViewer?.klipperCache?.axis_maximum ??
    null
)

const bedMinSize = computed(() =>
    store.state.printer.toolhead?.axis_minimum ??
    store.state.gui?.gcodeViewer?.klipperCache?.axis_minimum ??
    null
)

watch(kinematics, (newVal: string) => {
    if (viewer === null || !newVal) return

    viewer.bed.setDelta(newVal.includes('delta'))
}, { immediate: true })

watch(bedMinSize, (newVal: number[] | null) => {
    if (newVal === null || viewer === null || viewer.bed === null) return

    viewer.bed.buildVolume.x.min = newVal[0]
    viewer.bed.buildVolume.y.min = newVal[1]
    viewer.bed.buildVolume.z.min = newVal[2]
}, { deep: true, immediate: true })

watch(bedMaxSize, (newVal: number[] | null) => {
    if (newVal === null || viewer === null || viewer.bed === null) return

    viewer.bed.buildVolume.x.max = newVal[0]
    viewer.bed.buildVolume.y.max = newVal[1]
    viewer.bed.buildVolume.z.max = newVal[2]
}, { deep: true, immediate: true })

const progressColor = computed(() => store.state.gui.gcodeViewer?.progressColor ?? '#FFFFFF')

watch(progressColor, (newVal: string) => {
    viewer?.setProgressColor(newVal)
})

watch(scrubPlaying, (to: boolean): void => {
    if (!to) {
        if (scrubInterval.value) clearInterval(scrubInterval.value)
        scrubPlaying.value = false
        scrubInterval.value = undefined
        return
    }

    if (viewer === null) {
        scrubPlaying.value = false
        return
    }

    if (scrubInterval.value) {
        clearInterval(scrubInterval.value)
        scrubInterval.value = undefined
    }

    scrubPlaying.value = true
    if (scrubPosition.value >= scrubFileSize.value) {
        scrubPosition.value = 0
    }

    viewer?.gcodeProcessor.updateFilePosition(scrubPosition.value - 30000)
    scrubInterval.value = setInterval(() => {
        scrubPosition.value += 100 * scrubSpeed.value
        viewer?.gcodeProcessor.updateFilePosition(scrubPosition.value)
        viewer?.simulateToolPosition()
        if (tracking.value || scrubPosition.value >= scrubFileSize.value) {
            scrubPlaying.value = false
        }
    }, 200)
})

const showScrubber = computed(() => !tracking.value && scrubFileSize.value > 0)

const updateScrubPosition = debounce((to: number): void => {
    if (viewer === null || tracking.value) return

    viewer.gcodeProcessor.updateFilePosition(to)
    viewer.simulateToolPosition()
}, 200)

watch(scrubPosition, (to: number) => {
    updateScrubPosition(to)
})

function fastForward(): void {
    if (viewer === null) return

    scrubPosition.value = scrubFileSize.value
    viewer.gcodeProcessor.updateFilePosition(scrubPosition.value)
}

function objectCallback(metadata: ViewerObjectMetadata | null) {
    if (metadata?.cancelled === false) {
        excludeObject.value.name = metadata.name ?? 'UNKNOWN'
        excludeObject.value.bool = true
    }
}

function cancelObject() {
    socket.emit('printer.gcode.script', { script: 'EXCLUDE_OBJECT NAME=' + excludeObject.value.name })
}
</script>

<!-- Because the viewer lives outside of the components DOM it can't be scoped -->
<style>
.viewer {
    width: 100%;
    height: calc(var(--app-height) - 240px);
    border: 1px solid #3f3f3f;
}

.withScrubber .viewer {
    height: calc(var(--app-height) - 300px);
}

@media (min-width: 600px) and (max-width: 959px) {
    .viewer {
        height: calc(var(--app-height) - 295px);
    }

    .withScrubber .viewer {
        height: calc(var(--app-height) - 360px);
    }
}

@media (max-width: 599px) {
    .viewer {
        height: calc(var(--app-height) - 340px);
    }

    .withScrubber .viewer {
        height: calc(var(--app-height) - 340px);
    }
}
</style>

<style scoped>
.scrubber {
    position: relative;
    left: 0;
    right: 0;
    bottom: 5px;
}
</style>
