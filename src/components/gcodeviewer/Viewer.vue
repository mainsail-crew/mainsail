<!-- Because the viewer lives outside of the components DOM it can't be scoped -->
<style>
.viewer {
    width: 100%;
    height: calc(var(--app-height) - 266px);
    border: 1px solid #3f3f3f;
}

.slider-autoheight,
.slider-autoheight .v-slider {
    height: calc(var(--app-height) - 286px);
}

@media (min-width: 600px) and (max-width: 959px) {
    .viewer {
        height: calc(var(--app-height) - 318px);
    }
    .slider-autoheight,
    .slider-autoheight .v-slider {
        height: calc(var(--app-height) - 338px);
    }
}

@media (max-width: 599px) {
    .viewer {
        height: calc(var(--app-height) - 356px);
    }
    .slider-autoheight,
    .slider-autoheight .v-slider {
        height: calc(var(--app-height) - 376px);
    }
}

.slider-autoheight .v-slider {
    margin-top: 0;
    margin-bottom: 0;
}
.slider-autoheight .v-input__slot {
    height: 100%;
}
</style>

<style scoped>
.progress-text {
    font-size: small;
}

.progress-container {
    position: absolute;
    width: 80.5%;
}

.disable-transition {
    transition: none !important;
}

</style>

<template>
    <div>
        <panel :title="$t('GCodeViewer.Title')" icon="mdi-video-3d" card-class="gcode-viewer-panel">
            <template v-slot:buttons>
                <v-btn 
                    :icon="$vuetify.breakpoint.xs"
                    :text="$vuetify.breakpoint.smAndUp"
                    tile
                    @click="reloadViewer"
                    color="info"
                    class="ml-3"
                    v-show="reloadRequired"
                >
                    <span class="d-none d-sm-block">{{$t("GCodeViewer.ReloadRequired")}}</span>
                    <v-icon class="d-sm-none">mdi-reload-alert</v-icon>
                </v-btn>
                <v-btn icon tile @click="resetCamera"><v-icon>mdi-camera-retake</v-icon></v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <div ref="viewerCanvasContainer"></div>
                    </v-col>
                    <v-col class="col-auto pr-6">
                        <v-slider
                            vertical
                            :disabled="loading || !loadedFile"
                            :max="maxZSlider"
                            :min="0"
                            :value="zSlider"
                            class="slider-autoheight mt-3"
                            @input="updateZSlider"
                        ></v-slider>
                    </v-col>
                </v-row>
                <v-row class="mt-0 d-flex align-top">
                    <v-col>
                        <v-row>
                            <v-col order-md="2" class="d-flex align-content-space-around justify-center flex-wrap flex-md-nowrap col-12 col-md-4"> 
                                <template v-if="loadedFile === null">
                                    <v-btn @click="loadCurrentFile" class="mr-3" v-if="sdCardFilePath !== '' && sdCardFilePath !== loadedFile">{{ $t("GCodeViewer.LoadCurrentFile")}}</v-btn>
                                    <v-btn @click="chooseFile">{{ $t("GCodeViewer.LoadLocal") }}</v-btn>
                                </template>
                                <template v-else>
                                    <v-btn @click="tracking=!tracking" class="mr-3" v-if="showTrackingButton"><v-icon v-html="tracking ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline'" class="mr-2"></v-icon>{{ $t("GCodeViewer.Tracking") }}</v-btn>
                                    <v-btn @click="clearLoadedFile">{{ $t("GCodeViewer.ClearLoadedFile") }}</v-btn>
                                </template>
                            </v-col>
                            <v-col class="col-12 col-sm-6 col-md-4">
                                <v-select :items="colorModes" :label="$t('GCodeViewer.ColorMode')" item-text="text" dense v-model="colorMode" hide-details outlined></v-select>
                            </v-col>
                            <v-col order-md="3" class="col-12 col-sm-6 col-md-4">
                                <v-select :items="renderQualities" :label="$t('GCodeViewer.RenderQuality')" item-text="label" dense v-model="renderQuality" hide-details outlined></v-select>
                            </v-col>
                        </v-row>
                    </v-col>
                        <v-menu :offset-y="true" :offset-x="true" top :close-on-content-click="false" :title="$t('Files.SetupCurrentList')">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn class="minwidth-0 px-2 mr-3 mt-3" v-bind="attrs" v-on="on"><v-icon>mdi-cog</v-icon></v-btn>
                            </template>
                            <v-list>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="showCursor"  :label="$t('GCodeViewer.ShowToolhead')"></v-checkbox>
                                </v-list-item>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="showTravelMoves"  :label="$t('GCodeViewer.ShowTravelMoves')"></v-checkbox>
                                </v-list-item>
                                <v-list-item class="minHeight36" v-if="loadedFile === sdCardFilePath && printing_objects.length > 1">
                                    <v-checkbox class="mt-0" hide-details v-model="showObjectSelection"  :label="$t('GCodeViewer.ShowObjectSelection')"></v-checkbox>
                                </v-list-item>
                                <v-divider></v-divider>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="hdRendering" :label="$t('GCodeViewer.HDRendering')"></v-checkbox>
                                </v-list-item>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="forceLineRendering" :label="$t('GCodeViewer.ForceLineRendering')"></v-checkbox>
                                </v-list-item>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="transparency" :label="$t('GCodeViewer.Transparency')"></v-checkbox>
                                </v-list-item>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="voxelMode" :label="$t('GCodeViewer.VoxelMode')"></v-checkbox>
                                </v-list-item>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="specularLighting" :label="$t('GCodeViewer.SpecularLighting')"></v-checkbox>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                </v-row>
                <input :accept="'.g,.gcode,.gc,.gco,.nc,.ngc,.tap'" @change="fileSelected" hidden multiple ref="fileInput" type="file" />
            </v-card-text>
        </panel>
        <v-snackbar v-model="loading" :timeout="-1" :value="true" fixed right bottom dark>
            <div>
                {{ $t('GCodeViewer.Rendering') }} - {{ loadingPercent }}%<br />
                <strong>{{ this.loadedFile }}</strong>
            </div>
            <v-progress-linear class="mt-2" :value="loadingPercent"></v-progress-linear>
            <template v-slot:action="{ attrs }">
                <v-btn color="red" text v-bind="attrs" style="min-width: auto;" @click="cancelRendering()">
                    <v-icon class="0">mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
        <v-snackbar v-model="downloadSnackbar.status" :timeout="-1" :value="true" fixed right bottom dark>
            <template v-if="downloadSnackbar.total > 0">
                <div>
                    {{ $t('GCodeViewer.Downloading') }} - {{ Math.round(downloadSnackbar.percent) }} % @ {{ formatFilesize(Math.round(downloadSnackbar.speed)) }}/s<br />
                    <strong>{{ downloadSnackbar.filename }}</strong>
                </div>
                <v-progress-linear class="mt-2" :value="downloadSnackbar.percent"></v-progress-linear>
            </template>
            <template v-else>
                <div>
                    {{ $t('GCodeViewer.Downloading') }}<br />
                    <strong>{{ downloadSnackbar.filename }}</strong>
                </div>
                <v-progress-linear class="mt-2" indeterminate></v-progress-linear>
            </template>
            <template v-slot:action="{ attrs }">
                <v-btn color="red" text v-bind="attrs" @click="cancelDownload" style="min-width: auto;" >
                    <v-icon class="0">mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Ref, Watch} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
// @ts-ignore
import GCodeViewer from '@sindarius/gcodeviewer'
import axios from 'axios'
import {formatFilesize} from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'

interface downloadSnackbar {
    status: boolean
    filename: string
    percent: number
    speed: number
    total: number
    cancelTokenSource: any
    lastProgress: {
        time: number
        loaded: number
    }
}

let viewer: any = null
@Component({
    components: {Panel}
})
export default class Viewer extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize

    private isBusy = false
    private loading = false
    private loadingPercent = 0

    private tracking = false
    private loadedFile: string | null = null

    private reloadRequired = false
    private fileSize = 0
    private maxZSlider = 100000
    private zSlider = this.maxZSlider
    private zSlicerHeight = 100
    private renderQuality = this.renderQualities[2]

    private downloadSnackbar: downloadSnackbar = {
        status: false,
        filename: '',
        percent: 0,
        speed: 0,
        total: 0,
        cancelTokenSource: {},
        lastProgress: {
            time: 0,
            loaded: 0
        }
    }

    @Prop({type: String, default: '', required: false}) filename!: string
    @Ref('fileInput') fileInput!: HTMLInputElement
    //@Ref('viewerCanvasContainer') viewerCanvasContainer!: HTMLElement

    $refs!: {
        viewerCanvasContainer: HTMLElement
    }

    get renderQualities() {
        return [
            { label: this.$t('GCodeViewer.Low'),    value: 2 },
            { label: this.$t('GCodeViewer.Medium'), value: 3 },
            { label: this.$t('GCodeViewer.High'),   value: 4 },
            { label: this.$t('GCodeViewer.Ultra'),  value: 5 },
            { label: this.$t('GCodeViewer.Max'),    value: 6 },
        ]
    }

    async mounted() {
        this.loadedFile = this.$store.state.gcodeviewer?.loadedFileBackup ?? null
        viewer = this.$store.state.gcodeviewer?.viewerBackup ?? null

        await this.init()

        window.addEventListener('resize', this.eventListenerResize)
    }

    beforeDestroy() {
        if (viewer) {
            viewer.gcodeProcessor.loadingProgressCallback = null
            this.$store.dispatch('gcodeviewer/setLoadedFileBackup', this.loadedFile)
            this.$store.dispatch('gcodeviewer/setViewerBackup', viewer)
        }

        window.removeEventListener('resize', this.eventListenerResize)
    }

    eventListenerResize() {
        viewer?.resize()
    }

    get filePosition() {
        return this.printerIsPrinting ? this.$store.state.printer.virtual_sdcard.file_position : 0
    }

    get sdCardFilePath() {
        return this.$store.state.printer.print_stats?.filename ?? ''
    }

    get currentPosition() {
        return this.$store.state.printer.motion_report?.live_position ?? [0, 0, 0, 0]
    }

    get showTrackingButton() {
        return this.printerIsPrinting && this.sdCardFilePath === this.loadedFile
    }

    get printing_objects() {
        return this.$store.state.printer.exclude_object?.objects ?? []
    }

    get excluded_objects() {
        return this.$store.state.printer.exclude_object?.excluded_objects ?? []
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

        if (viewer === null) {
            await this.viewerInit(canvasElement)
        }

        this.registerProgressCallback()

        if (this.$route.query?.filename && this.loadedFile !== this.$route.query?.filename?.toString()) {
            //TODO: test without sleep
            await this.sleep(1000) //Give the store a chance to initializ before loading the file.
            await this.loadFile(this.$route.query.filename.toString())
        }
    }

    viewerInit(element: HTMLCanvasElement) {
        viewer = new GCodeViewer(element)
        viewer.init()
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
        viewer.gcodeProcessor.updateForceWireMode(this.forceLineRendering)
        viewer.gcodeProcessor.setAlpha(this.transparency)
        viewer.gcodeProcessor.setVoxelMode(this.voxelMode)
        viewer.gcodeProcessor.voxelWidth = this.voxelWidth
        viewer.gcodeProcessor.voxelHeight = this.voxelHeight
        viewer.gcodeProcessor.useSpecularColor(this.specularLighting)
        viewer.gcodeProcessor.setLiveTracking(false)

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
        this.maxZSlider = viewer.getMaxHeight() + 1
        this.zSlider = this.maxZSlider
        this.loading = false
        viewer.setCursorVisiblity(this.showCursor)

        if (this.loadedFile === this.sdCardFilePath && this.printing_objects.length) {
            let objects: any = []

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

            viewer.buildObjects.loadObjectBoundaries(objects)
            viewer.buildObjects.showObjectSelection(this.showObjectSelection)
        }

        viewer.gcodeProcessor.updateFilePosition(viewer.fileSize)
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
        this.downloadSnackbar.lastProgress.time = 0
        this.downloadSnackbar.filename = filename.startsWith('gcodes/') ? filename.slice(7) : filename
        const CancelToken = axios.CancelToken
        this.downloadSnackbar.cancelTokenSource = CancelToken.source()
        const text = await axios.get(this.apiUrl + '/server/files/' + encodeURI(filename), {
            cancelToken: this.downloadSnackbar.cancelTokenSource.token,
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                this.downloadSnackbar.percent = (progressEvent.loaded * 100) / progressEvent.total
                if (this.downloadSnackbar.lastProgress.time) {
                    const time = progressEvent.timeStamp - this.downloadSnackbar.lastProgress.time
                    const data = progressEvent.loaded - this.downloadSnackbar.lastProgress.loaded

                    if (time > 1000 || this.downloadSnackbar.speed === 0) {
                        this.downloadSnackbar.speed = data / (time / 1000)
                        this.downloadSnackbar.lastProgress.time = progressEvent.timeStamp
                        this.downloadSnackbar.lastProgress.loaded = progressEvent.loaded
                    }
                } else this.downloadSnackbar.lastProgress.time = progressEvent.timeStamp

                this.downloadSnackbar.total = progressEvent.total
            }
        }).then(res => res.data.text()).catch((e) => {
            window.console.error(e.message)
        })
        this.downloadSnackbar.status = false
        this.loadedFile = this.downloadSnackbar.filename

        viewer.updateRenderQuality(this.renderQuality.value)
        await viewer.processFile(text)
        this.loadingPercent = 100
        this.finishLoad()
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
                {axes: 'X', position: newVal[0]},
                {axes: 'Y', position: newVal[1]},
                {axes: 'Z', position: newVal[2]},
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
        } else {
            viewer.gcodeProcessor.updateFilePosition(viewer.fileSize)
        }
    }

    @Watch('tracking')
    async trackingChanged(newVal: boolean) {
        if (!viewer) return
        if (newVal) {
            //Set zSlider to max value
            this.zSlider = this.maxZSlider
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
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.showCursor', value: newVal})
    }

    @Watch('showCursor')
    showCursorChanged(newVal: boolean) {
        viewer?.setCursorVisiblity(newVal)
    }

    get showTravelMoves(): boolean {
        return this.$store.state.gui.gcodeViewer.showTravelMoves ?? false
    }

    set showTravelMoves(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.showTravelMoves', value: newVal})
    }

    @Watch('showTravelMoves')
    showTravelMovesChanged(newVal: boolean) {
        viewer?.toggleTravels(newVal)
    }

    get showObjectSelection(): boolean {
        return this.$store.state.gui.gcodeViewer.showObjectSelection ?? false
    }

    set showObjectSelection(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.showObjectSelection', value: newVal})
    }

    @Watch('showObjectSelection')
    showObjectSelectionChanged(newVal: boolean) {
        viewer?.buildObjects.showObjectSelection(newVal)
    }

    get hdRendering() {
        return this.$store.state.gui.gcodeViewer.hdRendering
    }

    set hdRendering(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.hdRendering', value: newVal})
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
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.forceLineRendering', value: newVal})
    }

    @Watch('forceLineRendering')
    async forceLineRenderingChanged(newVal: boolean) {
        if (viewer) {
            viewer.gcodeProcessor.updateForceWireMode(newVal)
            await this.reloadViewer()
        }
    }

    get transparency() {
        return this.$store.state.gui.gcodeViewer.transparency
    }

    set transparency(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.transparency', value: newVal})
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
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.voxelMode', value: newVal})
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
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.voxelWidth', value: newVal})
    }

    get voxelHeight() {
        return this.$store.state.gui.gcodeViewer.voxelHeight ?? 1
    }

    set voxelHeight(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.voxelHeight', value: newVal})
    }

    get specularLighting() {
        return this.$store.state.gui.gcodeViewer.specularLighting
    }

    set specularLighting(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.specularLighting', value: newVal})
    }

    @Watch('specularLighting')
    async specularLightingChanged(newVal: boolean) {
        if (viewer) {
            viewer.gcodeProcessor.useSpecularColor(newVal)
            //await this.reloadViewer()
        }
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
        {text: 'Extruder', value: 0},
        {text: 'Feed Rate', value: 1},
        {text: 'Feature', value: 2},
    ]

    get colorMode(): number {
        return this.$store.state.gui.gcodeViewer?.colorMode ?? 2
    }

    set colorMode(newVal: number) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.colorMode', value: newVal})

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
        return this.$store.state.printer.configfile?.settings?.printer?.kinematics ?? ''
    }

    @Watch('kinematics')
    kinematicsChanged(newVal: string) {
        if (viewer && newVal) {
            viewer.bed.setDelta(newVal.includes('delta'))
        }
    }

    get bedMinSize() {
        return this.$store.state.printer.toolhead?.axis_minimum ?? null
    }

    @Watch('bedMinSize', {deep: true})
    bedMinSizeChanged(newVal: number[] | null) {
        if (viewer && newVal) {
            viewer.bed.buildVolume['x'].min = newVal[0]
            viewer.bed.buildVolume['y'].min = newVal[1]
            viewer.bed.buildVolume['z'].min = newVal[2]
        }
    }

    get bedMaxSize() {
        return this.$store.state.printer.toolhead?.axis_maximum ?? null
    }

    @Watch('bedMaxSize', {deep: true})
    bedMaxSizeChanged(newVal: number[] | null) {
        if (newVal && viewer) {
            viewer.bed.buildVolume['x'].max = newVal[0]
            viewer.bed.buildVolume['y'].max = newVal[1]
            viewer.bed.buildVolume['z'].max = newVal[2]
        }
    }

    @Watch('zSlider')
    zSliderChanged(newVal: number) {
        viewer?.setZClipPlane(newVal, -1)
        viewer?.forceRender()
    }

    get progressColor() {
        return this.$store.state.gui.gcodeViewer?.progressColor ?? '#FFFFFF'
    }

    @Watch('progressColor')
    progressColorChanged(newVal: string) {
        viewer?.setProgressColor(newVal)
    }

    updateZSlider(newVal: any) {
        this.zSlider = newVal
    }
}
</script>

