<template>
    <v-card>
        <v-toolbar flat dense>
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-video-3d</v-icon>{{ $t('GCodeViewer.Title') }}</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="tracking=!tracking" v-if="showTrackingButton" small>{{ $t("GCodeViewer.TrackPrint")}}</v-btn>
            <v-btn @click="loadCurrentFile" v-if="sdCardFilePath !== '' && sdCardFilePath !== loadedFile" small>{{ $t("GCodeViewer.LoadCurrentFile")}}</v-btn>
            <v-btn @click="reloadViewer" color="info" v-show="reloadRequired" small>{{$t("GCodeViewer.ReloadRequired")}}</v-btn>
            <v-btn @click="resetCamera" class="px-2 minwidth-0 ml-3" color="grey darken-3" small dense><v-icon small>mdi-camera-retake</v-icon></v-btn>
        </v-toolbar>
        <v-card-text>
            <v-row v-if="loading">
                <v-col>
                    <v-progress-linear :value="loadingPercent" :height="25" rounded>
                        <span class="progress-text">{{loadingPercent}}%</span>
                    </v-progress-linear>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div ref="viewerCanvasContainer"></div>
                </v-col>
                <v-col class="col-auto pr-6">
                    <v-slider
                        vertical
                        :disabled="tracking"
                        :max="maxZSlider"
                        :min="0"
                        :value="zSlider"
                        class="slider-autoheight"
                        @input="updateZSlider"
                    ></v-slider>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-btn @click="chooseFile">{{ $t("GCodeViewer.LoadLocal") }}</v-btn>
                </v-col>
                <v-col>
                    <v-switch :label="$t('GCodeViewer.ForceLineRendering')" class="mt-0" v-model="forceLineRendering" hide-details dense></v-switch>
                </v-col>
                <v-col>
                    <v-select :items="renderQualities" :label="$t('GCodeViewer.RenderQuality')" item-text="label" dense v-model="renderQuality" hide-details></v-select>
                </v-col>
            </v-row>
            <input :accept="'.g,.gcode,.gc,.gco,.nc,.ngc,.tap'" @change="fileSelected" hidden multiple ref="fileInput" type="file" />
        </v-card-text>
    </v-card>
</template>

<!-- Because the viewer lives outside of the components DOM it can't be scoped -->
<style>
.viewer {
	width: 100%;
	height: calc(100vh - 260px);
	border: 1px solid #3f3f3f;
}

.slider-autoheight,
.slider-autoheight .v-slider {
    height: calc(100vh - 260px);
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

<script lang="ts">
import {Component, Mixins, Prop, Ref, Watch} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
// @ts-ignore
import GCodeViewer from '@sindarius/gcodeviewer'
import {Debounce} from 'vue-debounce-decorator'

let viewer: any = null
let trackingBackup = false
let loadedFileBackup = ''

@Component
export default class Viewer extends Mixins(BaseMixin) {
    private canvasBackup: HTMLCanvasElement | null = null
    private isBusy = false
    private loading = false
    private loadingPercent = 0

    private tracking = trackingBackup
    private loadedFile = loadedFileBackup

    private reloadRequired = false
    private fileSize = 0
    private maxZSlider = 100000
    private zSlider = this.maxZSlider
    private zSlicerHeight = 100
    private renderQuality = this.renderQualities[2]

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
        await this.init()
    }

    get filePosition() {
        return this.printerIsPrinting ? this.$store.state.printer.virtual_sdcard.file_position : 0
    }

    get sdCardConfigPath() {
        return this.$store.state.printer.configfile?.settings?.virtual_sdcard?.path ?? ''
    }

    get sdCardFilePath() {
        return this.$store.state.printer.virtual_sdcard?.file_path?.replace(this.sdCardConfigPath+'/', '') ?? ''
    }

    get currentPosition() {
        return this.$store.state.printer.motion_report?.live_position ?? [0, 0, 0, 0]
    }

    get showTrackingButton() {
        return this.printerIsPrinting && this.sdCardFilePath === this.loadedFile
    }

    async init() {
        if (this.canvasBackup === null) {
            let canvasElement = document.createElement('canvas')
            canvasElement.className = 'viewer'
            this.$refs.viewerCanvasContainer.appendChild(canvasElement)
            this.canvasBackup = canvasElement
            this.viewerInit(canvasElement)
            if (this.$route.query.filename) {
                await this.sleep(2000) //Give the store a chance to initializ before loading the file.
                await this.loadFile(this.$route.query.filename.toString())
            }
        } else {
            if (![this.loadedFile, '', null, undefined].includes(this.$route.query.filename.toString())) {
                this.loadedFile = this.$route.query.filename.toString()
                await this.loadFile(this.$route.query.filename.toString())
            }

            this.$refs.viewerCanvasContainer.appendChild(this.canvasBackup)
        }
        this.registerProgressCallback()
    }

    viewerInit(element: HTMLCanvasElement) {
        viewer = new GCodeViewer(element)
        viewer.init()
        viewer.setBackgroundColor('#121212')
        viewer.setCursorVisiblity(false)
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

        viewer.gcodeProcessor.updateForceWireMode(this.forceLineRendering)
        viewer.gcodeProcessor.setLiveTracking(false)

        this.loadToolColors(this.extruderColors)

        if (viewer.lastLoadFailed()) {
            this.renderQuality = this.renderQualities[0]
            viewer.updateRenderQuality(1)
            viewer.clearLoadFlag()
        }
    }

    registerProgressCallback() {
        viewer.gcodeProcessor.loadingProgressCallback = (progress: number) => {
            this.loadingPercent = Math.ceil(progress * 100)
            this.loading = this.loadingPercent <= 99
        }
    }

    beforeDestroy() {
        if (viewer) {
            viewer.gcodeProcessor.loadingProgressCallback = null
        }
    }

    chooseFile() {
        if (!this.isBusy) {
            this.fileInput.click()
        }
    }

    finishLoad() {
        this.maxZSlider = viewer.getMaxHeight()
        this.zSlider = this.maxZSlider
        this.loading = false
        viewer.setCursorVisiblity(this.showCursor)
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
        let response = await fetch(this.apiUrl + '/server/files/gcodes/' + encodeURI(filename))
        let text = await response.text()
        viewer.updateRenderQuality(this.renderQuality.value)
        await viewer.processFile(text)
        this.loadingPercent = 100
        this.finishLoad()
    }

    async sleep(ms: number) {
        await new Promise((resolve) => setTimeout(resolve, ms))
    }

    loadCurrentFile() {
        this.loadFile(this.sdCardFilePath)
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

    @Watch('forceLineRendering')
    async forceLineRenderingChanged(newVal: boolean) {
        if (viewer) {
            viewer.gcodeProcessor.updateForceWireMode(newVal)
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
        if (newVal > 0 && this.printerIsPrinting && this.tracking) {
            viewer.gcodeProcessor.updateFilePosition(newVal)
        } else {
            viewer.gcodeProcessor.updateFilePosition(0)
        }
    }

    @Watch('loadedFile')
    loadedFileChanged(newVal: string) {
        loadedFileBackup = newVal //We need to keep the backup in sync for when component comes out of scope.
    }

    @Watch('tracking')
    async trackingChanged(newVal: boolean) {
        trackingBackup = newVal
        if (!viewer) return
        if (newVal) {
            //Force renderers reload.
            viewer.gcodeProcessor.updateFilePosition(0)
            viewer.gcodeProcessor.forceRedraw()
        } else viewer.gcodeProcessor.setLiveTracking(false)
    }

    @Watch('printerIsPrinting')
    printerIsPrintingChanged() {
        this.tracking = false
    }

    get showCursor() {
        try {
            return this.$store.state.gui.gcodeViewer.showCursor ?? false
        } catch {
            return false
        }
    }

    @Watch('showCursor')
    showCursorChanged(newVal: boolean) {
        viewer?.setCursorVisiblity(newVal)
    }

    get extruderColors() {
        return this.$store.state.gui.gcodeViewer?.extruderColors ?? false
    }

    loadToolColors(colors: string[]) {
        if (viewer && colors.length) {
            viewer.gcodeProcessor.resetTools()
            colors.forEach((color: string) => {
                //Todo get nozzle size
                viewer.gcodeProcessor.addTool(color, 0.4) //Default the nozzle to 0.4 for now.
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

    get colorMode() {
        return this.$store.state.gui.gcodeViewer?.colorMode ?? 'extruder'
    }

    @Watch('colorMode')
    colorModeChanged(newVal: string) {
        if (!viewer) return
        if (newVal) {
            const mode = newVal === 'extruder' ? 0 : 1 //Magic number until I export the enum 0 = Color 1 = Feed Rate
            if (viewer.gcodeProcessor.colorMode !== mode) {
                this.setReloadRequiredFlag()
                viewer.gcodeProcessor.setColorMode(mode)
            }
        }
    }

    get backgroundColor() {
        return this.$store.state.gui.gcodeViewer?.backgroundColor ?? '#000000'
    }

    @Watch('backgroundColor')
    backgroundColorChanged(newVal: string) {
        if (!viewer) return
        viewer.setBackgroundColor(newVal)
    }

    get gridColor() {
        return this.$store.state.gui.gcodeViewer?.gridColor ?? '#000000'
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

    get forceLineRendering() {
        return this.$store.state.gui.gcodeViewer.forceLineRendering
    }

    set forceLineRendering(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.forceLineRendering', value: newVal})
    }

    @Watch('zSlider')
    zSliderChanged(newVal: number) {
        viewer?.setZClipPlane(newVal, -1)
    }

    get progressColor() {
        return this.$store.state.gui.gcodeViewer?.progressColor ?? '#FFFFFF'
    }

    @Watch('progressColor')
    progressColorChanged(newVal: string) {
        viewer?.setProgressColor(newVal)
    }

    @Debounce(100)
    updateZSlider(newVal: any) {
        this.zSlider = newVal
    }
}
</script>

