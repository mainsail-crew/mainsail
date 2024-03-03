<template>
    <div>
        <panel :title="panelTitle" :icon="mdiVideo3d" card-class="gcode-viewer-panel" :margin-bottom="false">
            <template #buttons>
                <v-btn
                    v-show="reloadRequired"
                    :icon="$vuetify.breakpoint.xs"
                    :text="$vuetify.breakpoint.smAndUp"
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
                            persistent-hint></v-slider>
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
                                            v-html="tracking ? mdiToggleSwitch : mdiToggleSwitchOffOutline"></v-icon>
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
                                    <template #activator="{ on, attrs }">
                                        <v-btn class="minwidth-0 px-2 ml-3" v-bind="attrs" v-on="on">
                                            <v-icon>{{ mdiCog }}</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="showCursor"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.ShowToolhead')"></v-checkbox>
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="showTravelMoves"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.ShowTravelMoves')"></v-checkbox>
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="showGCode"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.ShowGCode')"></v-checkbox>
                                        </v-list-item>

                                        <v-list-item
                                            v-if="loadedFile === sdCardFilePath && printing_objects.length"
                                            class="minHeight36">
                                            <v-checkbox
                                                v-model="showObjectSelection"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.ShowObjectSelection')"></v-checkbox>
                                        </v-list-item>
                                        <v-divider></v-divider>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="hdRendering"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.HDRendering')"></v-checkbox>
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="forceLineRendering"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.ForceLineRendering')"></v-checkbox>
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="transparency"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.Transparency')"></v-checkbox>
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="voxelMode"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.VoxelMode')"></v-checkbox>
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="specularLighting"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.SpecularLighting')"></v-checkbox>
                                        </v-list-item>
                                        <v-list-item class="minHeight36">
                                            <v-checkbox
                                                v-model="cncMode"
                                                class="mt-0"
                                                hide-details
                                                :label="$t('GCodeViewer.CNCMode')"></v-checkbox>
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
            <resize-observer @notify="handleResize" />
        </panel>
        <v-snackbar v-model="loading" :timeout="-1" :value="true" fixed right bottom>
            <div>
                {{ $t('GCodeViewer.Rendering') }} - {{ loadingPercent }}%
                <br />
                <strong>{{ loadedFile }}</strong>
            </div>
            <v-progress-linear class="mt-2" :value="loadingPercent"></v-progress-linear>
            <template #action="{ attrs }">
                <v-btn color="red" text v-bind="attrs" style="min-width: auto" @click="cancelRendering()">
                    <v-icon class="0">{{ mdiClose }}</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
        <v-snackbar v-model="downloadSnackbar.status" :timeout="-1" :value="true" fixed right bottom>
            <template v-if="downloadSnackbar.total > 0">
                <div>
                    {{ $t('GCodeViewer.Downloading') }} - {{ Math.round(downloadSnackbar.percent) }} % @
                    {{ formatFilesize(Math.round(downloadSnackbar.speed)) }}/s
                    <br />
                    <strong>{{ downloadSnackbar.filename }}</strong>
                </div>
                <v-progress-linear class="mt-2" :value="downloadSnackbar.percent"></v-progress-linear>
            </template>
            <template v-else>
                <div>
                    {{ $t('GCodeViewer.Downloading') }}
                    <br />
                    <strong>{{ downloadSnackbar.filename }}</strong>
                </div>
                <v-progress-linear class="mt-2" indeterminate></v-progress-linear>
            </template>
            <template #action="{ attrs }">
                <v-btn color="red" text v-bind="attrs" style="min-width: auto" @click="cancelDownload">
                    <v-icon class="0">{{ mdiClose }}</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
        <v-dialog v-model="excludeObject.bool" max-width="400">
            <v-card>
                <v-toolbar flat dense>
                    <v-toolbar-title>
                        <span class="subheading">
                            <v-icon left>{{ mdiSelectionRemove }}</v-icon>
                            {{ $t('Panels.StatusPanel.ExcludeObject.ExcludeObjectHeadline') }}
                        </span>
                    </v-toolbar-title>
                </v-toolbar>
                <v-card-text class="mt-3">
                    {{ $t('Panels.StatusPanel.ExcludeObject.ExcludeObjectText', { name: excludeObject.name }) }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="excludeObject.bool = false">
                        {{ $t('Panels.StatusPanel.ExcludeObject.Cancel') }}
                    </v-btn>
                    <v-btn color="primary" text @click="cancelObject">
                        {{ $t('Panels.StatusPanel.ExcludeObject.ExcludeObject') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import GCodeViewer from '@sindarius/gcodeviewer'
import axios, { AxiosProgressEvent } from 'axios'
import { formatFilesize } from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import CodeStream from '@/components/gcodeviewer/CodeStream.vue'
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
import { Debounce } from 'vue-debounce-decorator'

interface downloadSnackbar {
    status: boolean
    filename: string
    percent: number
    speed: number
    total: number
    cancelTokenSource: any
}

let viewer: any = null
@Component({
    components: { Panel, CodeStream },
})
export default class Viewer extends Mixins(BaseMixin) {
    /**
     * Icons
     */
    mdiReloadAlert = mdiReloadAlert
    mdiCameraRetake = mdiCameraRetake
    mdiToggleSwitch = mdiToggleSwitch
    mdiToggleSwitchOffOutline = mdiToggleSwitchOffOutline
    mdiClose = mdiClose
    mdiCog = mdiCog
    mdiVideo3d = mdiVideo3d
    mdiPlay = mdiPlay
    mdiPause = mdiPause
    mdiFastForward = mdiFastForward
    mdiBroom = mdiBroom
    mdiSelectionRemove = mdiSelectionRemove

    formatFilesize = formatFilesize

    private isBusy = false
    private loading = false
    private loadingPercent = 0

    private tracking = false
    private loadedFile: string | null = null

    private reloadRequired = false
    private fileSize = 0
    private renderQuality = this.renderQualities[2]

    private scrubPosition = 0
    private scrubPlaying = false
    private scrubSpeed = 1
    private scrubInterval: ReturnType<typeof setInterval> | undefined = undefined
    private scrubFileSize = 0

    private downloadSnackbar: downloadSnackbar = {
        status: false,
        filename: '',
        percent: 0,
        speed: 0,
        total: 0,
        cancelTokenSource: {},
    }

    private excludeObject = {
        bool: false,
        name: '',
    }

    private fileData: string = ''

    @Prop({ type: String, default: '', required: false }) declare filename: string
    @Ref('fileInput') declare fileInput: HTMLInputElement
    @Ref('viewerCanvasContainer') declare viewerCanvasContainer: HTMLElement

    declare $refs: {
        viewerCanvasContainer: HTMLElement
    }

    get renderQualities() {
        return [
            { label: this.$t('GCodeViewer.Low'), value: 2 },
            { label: this.$t('GCodeViewer.Medium'), value: 3 },
            { label: this.$t('GCodeViewer.High'), value: 4 },
            { label: this.$t('GCodeViewer.Ultra'), value: 5 },
            { label: this.$t('GCodeViewer.Max'), value: 6 },
        ]
    }

    async mounted() {
        this.loadedFile = this.$store.state.gcodeviewer?.loadedFileBackup ?? null
        viewer = this.$store.state.gcodeviewer?.viewerBackup ?? null
        await this.init()

        if (this.loadedFile !== null) this.scrubFileSize = viewer.fileSize
        if (viewer) {
            this.fileData = viewer.fileData
        }
    }

    beforeDestroy() {
        if (viewer) {
            viewer.gcodeProcessor.loadingProgressCallback = null
            this.$store.dispatch('gcodeviewer/setLoadedFileBackup', this.loadedFile)
            this.$store.dispatch('gcodeviewer/setViewerBackup', viewer)
        }

        this.scrubPlaying = false
        if (this.scrubInterval) {
            clearInterval(this.scrubInterval)
            this.scrubInterval = undefined
        }
    }

    @Debounce(200)
    handleResize() {
        this.$nextTick(() => {
            viewer?.resize()
        })
    }

    get panelTitle() {
        let title = this.$t('GCodeViewer.Title').toString()

        if (this.loadedFile) title += `: ${this.loadedFile}`

        return title
    }

    get filePosition() {
        return this.printerIsPrinting ? this.$store.state.printer.virtual_sdcard.file_position : 0
    }

    get sdCardFilePath() {
        return this.$store.state.printer.print_stats?.filename ?? ''
    }

    get livePosition() {
        return this.$store.state.printer.motion_report?.live_position ?? [0, 0, 0, 0]
    }

    get gcodeOffset() {
        return this.$store.state.printer?.gcode_move?.homing_origin ?? [0, 0, 0]
    }

    get currentPosition() {
        return [
            this.livePosition[0] - this.gcodeOffset[0],
            this.livePosition[1] - this.gcodeOffset[1],
            this.livePosition[2] - this.gcodeOffset[2],
            this.livePosition[3],
        ]
    }

    get showTrackingButton() {
        return this.printerIsPrinting && this.sdCardFilePath === this.loadedFile
    }

    get printing_objects() {
        return this.$store.state.printer.exclude_object?.objects ?? []
    }

    @Watch('printing_objects')
    printing_objectsChanged() {
        this.refreshPrintingObjects()
    }

    get excluded_objects() {
        return this.$store.state.printer.exclude_object?.excluded_objects ?? []
    }

    @Watch('excluded_objects')
    excluded_objectsChanged() {
        this.refreshPrintingObjects()
    }

    get nozzle_diameter() {
        return this.$store.state.printer.configfile?.settings?.extruder?.nozzle_diameter ?? 0.4
    }

    async init() {
        let canvasElement = this.$store.state.gcodeviewer?.canvasBackup ?? null

        if (canvasElement === null) {
            canvasElement = document.createElement('canvas')
            canvasElement.className = 'viewer'
            this.$refs.viewerCanvasContainer.appendChild(canvasElement)
            await this.$store.dispatch('gcodeviewer/setCanvasBackup', canvasElement)
        } else {
            this.$refs.viewerCanvasContainer.appendChild(canvasElement)
            if (viewer?.gcodeProcessor) {
                viewer.gcodeProcessor.updateFilePosition(viewer?.fileSize)
            }
        }

        if (viewer === null) await this.viewerInit(canvasElement)

        this.registerProgressCallback()

        if (this.$route.query?.filename && this.loadedFile !== this.$route.query?.filename?.toString()) {
            //TODO: test without sleep
            await this.sleep(1000) //Give the store a chance to initialize before loading the file.
            await this.loadFile(this.$route.query.filename.toString())
        }
    }

    async viewerInit(element: HTMLCanvasElement) {
        viewer = new GCodeViewer(element)
        await viewer.init()
        viewer.setBackgroundColor(this.backgroundColor)
        viewer.bed.setBedColor(this.gridColor)
        viewer.setCursorVisiblity(this.showCursor)
        viewer.setZClipPlane(1000000, -1000000)
        viewer.axes.show(this.showAxes)
        viewer.bed.setDelta(this.kinematics.includes('delta'))

        if (this.bedMaxSize !== null) {
            viewer.bed.buildVolume['x'].max = this.bedMaxSize[0]
            viewer.bed.buildVolume['y'].max = this.bedMaxSize[1]
            viewer.bed.buildVolume['z'].max = this.bedMaxSize[2]
        }

        if (this.bedMinSize !== null) {
            viewer.bed.buildVolume['x'].min = this.bedMinSize[0]
            viewer.bed.buildVolume['y'].min = this.bedMinSize[1]
            viewer.bed.buildVolume['z'].min = this.bedMinSize[2]
        }

        viewer.gcodeProcessor.useHighQualityExtrusion(this.hdRendering)
        viewer.gcodeProcessor.updateForceWireMode(this.forceLineRendering || this.cncMode)
        viewer.gcodeProcessor.setAlpha(this.transparency)
        viewer.gcodeProcessor.setVoxelMode(this.voxelMode)
        viewer.gcodeProcessor.voxelWidth = this.voxelWidth
        viewer.gcodeProcessor.voxelHeight = this.voxelHeight
        viewer.gcodeProcessor.useSpecularColor(this.specularLighting)
        viewer.gcodeProcessor.setLiveTracking(false)
        viewer.gcodeProcessor.g1AsExtrusion = this.cncMode
        viewer.buildObjects.objectCallback = this.objectCallback

        this.loadToolColors(this.extruderColors)

        if (viewer.lastLoadFailed()) {
            this.renderQuality = this.renderQualities[0]
            viewer.updateRenderQuality(1)
            viewer.clearLoadFlag()
        }
    }

    registerProgressCallback() {
        if (viewer) {
            viewer.gcodeProcessor.loadingProgressCallback = (progress: number) => {
                this.loadingPercent = Math.ceil(progress * 100)
                this.loading = this.loadingPercent <= 99
            }
        }
    }

    async cancelRendering() {
        if (viewer) {
            viewer.gcodeProcessor.cancelLoad = true
            await this.sleep(1000)
        }
    }

    clearLoadedFile() {
        if (viewer) {
            this.scrubPlaying = false
            this.scrubFileSize = 0
            viewer.clearScene(true)
            this.loadedFile = null
            this.tracking = false
        }
    }

    chooseFile() {
        if (!this.isBusy) {
            this.fileInput.click()
        }
    }

    finishLoad() {
        this.loading = false
        viewer.setCursorVisiblity(this.showCursor)

        this.refreshPrintingObjects()
        this.scrubFileSize = viewer.fileSize

        viewer.gcodeProcessor.updateFilePosition(viewer.fileSize)
    }

    refreshPrintingObjects() {
        let objects: any = []

        if (this.loadedFile === this.sdCardFilePath && this.printing_objects.length) {
            this.printing_objects.forEach((object: any) => {
                const xValues = object.polygon.map((point: number[]) => point[0])
                const yValues = object.polygon.map((point: number[]) => point[1])

                objects.push({
                    cancelled: this.excluded_objects.includes(object.name),
                    name: object.name,
                    x: [Math.min(...xValues), Math.max(...xValues)],
                    y: [Math.min(...yValues), Math.max(...yValues)],
                })
            })
        }

        viewer.buildObjects.loadObjectBoundaries(objects)
        viewer.buildObjects.showObjectSelection(this.showObjectSelection)
    }

    async fileSelected(e: any) {
        const reader = new FileReader()
        reader.addEventListener('load', async (event) => {
            if (!event || !event.target) return
            const blob = event.target.result
            if (typeof blob === 'string') {
                this.fileSize = blob.length
                // Do something with result
                await viewer.processFile(blob)
                this.fileData = viewer.fileData
            }
            this.finishLoad()
        })
        this.tracking = false
        if (e.target.files?.length) {
            this.loadedFile = e?.target?.files[0].name
            reader.readAsText(e.target.files[0])
        }
        e.target.value = ''
    }

    async loadFile(filename: string) {
        this.downloadSnackbar.status = true
        this.downloadSnackbar.speed = 0
        this.downloadSnackbar.filename = filename.startsWith('gcodes/') ? filename.slice(7) : filename
        const CancelToken = axios.CancelToken
        this.downloadSnackbar.cancelTokenSource = CancelToken.source()
        const text = await axios
            .get(this.apiUrl + '/server/files/' + encodeURI(filename), {
                cancelToken: this.downloadSnackbar.cancelTokenSource.token,
                responseType: 'blob',
                onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
                    this.downloadSnackbar.percent = (progressEvent.progress ?? 0) * 100
                    this.downloadSnackbar.speed = progressEvent.rate ?? 0
                    this.downloadSnackbar.total = progressEvent.total ?? 0
                },
            })
            .then((res) => res.data.text())
            .catch((e) => {
                window.console.error(e.message)
            })
        this.downloadSnackbar.status = false
        this.loadedFile = this.downloadSnackbar.filename

        viewer.updateRenderQuality(this.renderQuality.value)
        await viewer.processFile(text)
        this.fileData = viewer.fileData
        this.loadingPercent = 100
        this.finishLoad()
        this.scrubFileSize = viewer.fileSize
    }

    cancelDownload() {
        this.downloadSnackbar.cancelTokenSource.cancel('User canceled download gcode file')
    }

    async sleep(ms: number) {
        await new Promise((resolve) => setTimeout(resolve, ms))
    }

    async loadCurrentFile() {
        await this.loadFile('gcodes/' + this.sdCardFilePath)
        this.loadedFile = this.sdCardFilePath
    }

    async reloadViewer() {
        if (this.loading) {
            //if we are actively loading signal a cancel and wait a second
            //This prevents a timing issue that can happen if a user changes settings and then
            //hits the reload viewer button. Will eventually move this to api
            viewer.gcodeProcessor.cancelLoad = true
            await this.sleep(1000)
        }

        this.reloadRequired = false
        this.loading = true
        this.loadingPercent = 0
        await viewer.reload()
        this.fileData = viewer.fileData
        this.loadingPercent = 100
        this.finishLoad()
    }

    resetCamera() {
        viewer.resetCamera()
    }

    setReloadRequiredFlag() {
        if (this.loadedFile && this.loadedFile != '') {
            this.reloadRequired = true
        }
    }

    @Watch('renderQuality')
    async renderQualityChanged(newVal: number) {
        if (viewer && viewer.renderQuality !== newVal) {
            viewer.updateRenderQuality(newVal)
            await this.reloadViewer()
        }
    }

    @Watch('currentPosition')
    currentPositionChanged(newVal: number[]) {
        if (viewer) {
            const position = [
                { axes: 'X', position: newVal[0] },
                { axes: 'Y', position: newVal[1] },
                { axes: 'Z', position: newVal[2] },
            ]

            viewer.updateToolPosition(position)
        }
    }

    @Watch('filePosition')
    filePositionChanged(newVal: number) {
        if (!viewer) return

        const offset = 350
        if (newVal > 0 && this.printerIsPrinting && this.tracking && newVal > offset) {
            viewer.gcodeProcessor.updateFilePosition(newVal - offset)
            this.scrubPosition = newVal - offset
        } else {
            viewer.gcodeProcessor.updateFilePosition(viewer.fileSize)
        }
    }

    @Watch('tracking')
    async trackingChanged(newVal: boolean) {
        if (!viewer) return
        if (newVal) {
            this.scrubPlaying = false
            //Force renderers reload.
            viewer.gcodeProcessor.updateFilePosition(0)
            viewer?.forceRender()
        } else {
            viewer.gcodeProcessor.setLiveTracking(false)
            await this.reloadViewer()
        }
    }

    @Watch('printerIsPrinting')
    printerIsPrintingChanged() {
        this.tracking = false
    }

    get showCursor(): boolean {
        return this.$store.state.gui.gcodeViewer.showCursor ?? false
    }

    set showCursor(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.showCursor', value: newVal })
    }

    @Watch('showCursor')
    showCursorChanged(newVal: boolean) {
        viewer?.setCursorVisiblity(newVal)
    }

    get showTravelMoves(): boolean {
        return this.$store.state.gui.gcodeViewer.showTravelMoves ?? false
    }

    set showTravelMoves(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.showTravelMoves', value: newVal })
    }

    get showGCode(): boolean {
        return this.$store.state.gui.gcodeViewer.showGCode ?? false
    }

    set showGCode(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.showGCode', value: newVal })
        if (newVal && viewer) {
            this.fileData = viewer.fileData
        }
        this.handleResize()
    }

    @Watch('showTravelMoves')
    showTravelMovesChanged(newVal: boolean) {
        viewer?.toggleTravels(newVal)
    }

    get showObjectSelection(): boolean {
        return this.$store.state.gui.gcodeViewer.showObjectSelection ?? false
    }

    set showObjectSelection(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.showObjectSelection', value: newVal })
    }

    @Watch('showObjectSelection')
    showObjectSelectionChanged(newVal: boolean) {
        viewer?.buildObjects.showObjectSelection(newVal)
    }

    get hdRendering() {
        return this.$store.state.gui.gcodeViewer.hdRendering
    }

    set hdRendering(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.hdRendering', value: newVal })
    }

    @Watch('hdRendering')
    async hdRenderingChanged(newVal: boolean) {
        if (viewer) {
            viewer.gcodeProcessor.useHighQualityExtrusion(newVal)
            await this.reloadViewer()
        }
    }

    get forceLineRendering() {
        return this.$store.state.gui.gcodeViewer.forceLineRendering
    }

    set forceLineRendering(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.forceLineRendering', value: newVal })
    }

    @Watch('forceLineRendering')
    async forceLineRenderingChanged(newVal: boolean) {
        if (viewer) {
            viewer.gcodeProcessor.updateForceWireMode(newVal || this.cncMode)
            await this.reloadViewer()
        }
    }

    get transparency() {
        return this.$store.state.gui.gcodeViewer.transparency
    }

    set transparency(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.transparency', value: newVal })
    }

    @Watch('transparency')
    async transparencyChanged(newVal: boolean) {
        if (viewer) {
            viewer.gcodeProcessor.setAlpha(newVal)
            await this.reloadViewer()
        }
    }

    get voxelMode() {
        return this.$store.state.gui.gcodeViewer.voxelMode
    }

    set voxelMode(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.voxelMode', value: newVal })
    }

    @Watch('voxelMode')
    async voxelModeChanged(newVal: boolean) {
        if (viewer) {
            viewer.gcodeProcessor.setVoxelMode(newVal)
            viewer.gcodeProcessor.voxelWidth = this.voxelWidth
            viewer.gcodeProcessor.voxelHeight = this.voxelHeight
            await this.reloadViewer()
        }
    }

    get voxelWidth() {
        return this.$store.state.gui.gcodeViewer.voxelWidth ?? 1
    }

    set voxelWidth(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.voxelWidth', value: newVal })
    }

    get voxelHeight() {
        return this.$store.state.gui.gcodeViewer.voxelHeight ?? 1
    }

    set voxelHeight(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.voxelHeight', value: newVal })
    }

    get specularLighting() {
        return this.$store.state.gui.gcodeViewer.specularLighting
    }

    set specularLighting(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.specularLighting', value: newVal })
    }

    @Watch('specularLighting')
    async specularLightingChanged(newVal: boolean) {
        if (viewer) {
            viewer.gcodeProcessor.useSpecularColor(newVal)
            //await this.reloadViewer()
        }
    }

    get cncMode() {
        return this.$store.state.gui.gcodeViewer.cncMode
    }

    set cncMode(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.cncMode', value: newVal })
        viewer.gcodeProcessor.g1AsExtrusion = newVal
        viewer.gcodeProcessor.updateForceWireMode(this.forceLineRendering || newVal)
        this.reloadViewer()
    }

    get extruderColors() {
        return this.$store.state.gui.gcodeViewer?.extruderColors ?? false
    }

    loadToolColors(colors: string[]) {
        if (viewer && colors.length) {
            viewer.gcodeProcessor.resetTools()
            colors.forEach((color: string) => {
                viewer.gcodeProcessor.addTool(color, this.nozzle_diameter)
            })
            this.setReloadRequiredFlag()
        }
    }

    @Watch('extruderColors')
    extruderColorsChanged(newVal: string[]) {
        if (viewer && newVal && newVal.length) {
            this.loadToolColors(newVal)
            this.setReloadRequiredFlag()
        }
    }

    private colorModes = [
        { text: 'Extruder', value: 0 },
        { text: 'Feed Rate', value: 1 },
        { text: 'Feature', value: 2 },
    ]

    get colorMode(): number {
        return this.$store.state.gui.gcodeViewer?.colorMode ?? 2
    }

    set colorMode(newVal: number) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.colorMode', value: newVal })

        if (viewer) {
            if (viewer.gcodeProcessor.colorMode !== newVal) {
                viewer.gcodeProcessor.setColorMode(newVal)
                this.reloadViewer()
            }
        }
    }

    get backgroundColor() {
        return this.$store.state.gui.gcodeViewer?.backgroundColor ?? '#121212'
    }

    @Watch('backgroundColor')
    backgroundColorChanged(newVal: string) {
        if (!viewer) return
        viewer.setBackgroundColor(newVal)
    }

    get gridColor() {
        return this.$store.state.gui.gcodeViewer?.gridColor ?? '#B3B3B3'
    }

    @Watch('gridColor')
    gridColorChanged(newVal: string) {
        if (!viewer) return
        viewer.bed.setBedColor(newVal)
    }

    get showAxes() {
        return this.$store.state.gui.gcodeViewer?.showAxes ?? true
    }

    @Watch('showAxes')
    showAxesChanged(newVal: boolean) {
        if (!viewer) return
        viewer.axes.show(newVal)
    }

    get minFeed() {
        return this.$store.state.gui.gcodeViewer?.minFeed ?? 20
    }

    @Watch('minFeed')
    minFeedChanged(newVal: number) {
        if (!viewer) return
        viewer.gcodeProcessor.updateColorRate(newVal * 60, this.maxFeed * 60)
    }

    get maxFeed() {
        return this.$store.state.gui.gcodeViewer?.maxFeed ?? 100
    }

    @Watch('maxFeed')
    maxFeedChanged(newVal: number) {
        if (!viewer) return
        viewer.gcodeProcessor.updateColorRate(this.minFeed * 60, newVal * 60)
    }

    get minFeedColor() {
        return this.$store.state.gui.gcodeViewer?.minFeedColor ?? '#0000FF'
    }

    @Watch('minFeedColor')
    minFeedColorUpdated(newVal: string) {
        if (!viewer) return
        viewer.gcodeProcessor.updateMinFeedColor(newVal)
        this.setReloadRequiredFlag()
    }

    get maxFeedColor() {
        return this.$store.state.gui.gcodeViewer?.maxFeedColor ?? '#FF0000'
    }

    @Watch('maxFeedColor')
    maxFeedColorUpdated(newVal: string) {
        if (!viewer) return
        viewer.gcodeProcessor.updateMaxFeedColor(newVal)
        this.setReloadRequiredFlag()
    }

    get kinematics() {
        return (
            this.$store.state.printer.configfile?.settings?.printer?.kinematics ??
            this.$store.state.gui?.gcodeViewer?.klipperCache?.kinematics ??
            ''
        )
    }

    get bedMaxSize() {
        return (
            this.$store.state.printer.toolhead?.axis_maximum ??
            this.$store.state.gui?.gcodeViewer?.klipperCache?.axis_maximum ??
            null
        )
    }

    get bedMinSize() {
        return (
            this.$store.state.printer.toolhead?.axis_minimum ??
            this.$store.state.gui?.gcodeViewer?.klipperCache?.axis_minimum ??
            null
        )
    }

    @Watch('kinematics')
    kinematicsChanged(newVal: string) {
        if (viewer && newVal) {
            viewer.bed.setDelta(newVal.includes('delta'))
        }
    }

    @Watch('bedMinSize', { deep: true })
    bedMinSizeChanged(newVal: number[] | null) {
        if (viewer && newVal) {
            viewer.bed.buildVolume['x'].min = newVal[0]
            viewer.bed.buildVolume['y'].min = newVal[1]
            viewer.bed.buildVolume['z'].min = newVal[2]
        }
    }

    @Watch('bedMaxSize', { deep: true })
    bedMaxSizeChanged(newVal: number[] | null) {
        if (newVal && viewer) {
            viewer.bed.buildVolume['x'].max = newVal[0]
            viewer.bed.buildVolume['y'].max = newVal[1]
            viewer.bed.buildVolume['z'].max = newVal[2]
        }
    }

    get progressColor() {
        return this.$store.state.gui.gcodeViewer?.progressColor ?? '#FFFFFF'
    }

    @Watch('progressColor')
    progressColorChanged(newVal: string) {
        viewer?.setProgressColor(newVal)
    }

    @Watch('scrubPlaying')
    scrubPlayingChanged(to: boolean): void {
        if (to) {
            if (this.scrubInterval) {
                clearInterval(this.scrubInterval)
                this.scrubInterval = undefined
            }
            this.scrubPlaying = true
            if (this.scrubPosition >= this.scrubFileSize) {
                this.scrubPosition = 0
            }

            viewer.gcodeProcessor.updateFilePosition(this.scrubPosition - 30000)
            this.scrubInterval = setInterval(() => {
                this.scrubPosition += 100 * this.scrubSpeed
                viewer.gcodeProcessor.updateFilePosition(this.scrubPosition)
                viewer.simulateToolPosition()
                if (this.tracking || this.scrubPosition >= this.scrubFileSize) {
                    this.scrubPlaying = false
                }
            }, 200)
        } else {
            if (this.scrubInterval) clearInterval(this.scrubInterval)
            this.scrubPlaying = false
            this.scrubInterval = undefined
        }
    }

    get showScrubber() {
        return !this.tracking && this.scrubFileSize > 0
    }

    @Debounce(200)
    @Watch('scrubPosition')
    updateScrubPosition(to: number): void {
        if (!this.tracking) {
            viewer.gcodeProcessor.updateFilePosition(to)
            viewer.simulateToolPosition()
        }
    }

    fastForward(): void {
        this.scrubPosition = this.scrubFileSize
        viewer.gcodeProcessor.updateFilePosition(this.scrubPosition)
    }

    objectCallback(metadata: any) {
        if (metadata?.cancelled === false) {
            this.excludeObject.name = metadata.name ?? 'UNKNOWN'
            this.excludeObject.bool = true
        }
    }

    cancelObject() {
        this.$socket.emit('printer.gcode.script', { script: 'EXCLUDE_OBJECT NAME=' + this.excludeObject.name })
        this.excludeObject.bool = false
    }
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
