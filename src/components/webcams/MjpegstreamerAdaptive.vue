<template>
    <div style="position: relative" class="d-flex justify-center">
        <div v-if="!isLoaded" class="text-center py-5">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <canvas
            ref="mjpegstreamerAdaptive"
            v-observe-visibility="viewportVisibilityChanged"
            width="600"
            height="400"
            :style="webcamStyle"
            :class="'webcamImage ' + (isLoaded ? '' : 'hiddenWebcam')"></canvas>
        <span v-if="isLoaded && showFpsCounter" class="webcamFpsOutput">
            {{ $t('Panels.WebcamPanel.FPS') }}: {{ fpsOutput }}
        </span>
        <v-row v-if="isLoaded && nozzleCalib && bigEnough" align="top" class="ma-0 pa-0">
            <v-col align="left" class="ma-0 pa-0">
                <span class="cmdButtonsTools">
                    <v-item-group class="ma-0 _btn-group">
                        <v-btn
                            v-for="tool in toolchangeMacros"
                            :key="tool.name"
                            small
                            :disabled="
                                isPrinting ||
                                !homedAxes.includes('xyz') ||
                                (isIdex && (idexMode == 'copy' || idexMode == 'mirror'))
                            "
                            class="cmdButton"
                            :loading="loadings.includes('set_' + tool.name.toLowerCase())"
                            :style="{
                                'background-color':
                                    tool.name == activeTool ? 'var(--color-primary)' : 'rgba(0,0,0,0.8)',
                                color: tool.name == activeTool ? 'var(--v-btn-text-primary)' : 'white',
                            }"
                            @click="doT('_NOZZLE_CALIBRATION_LOAD_TOOL T=' + tool.name.replace('T', ''))">
                            {{ tool.name }}
                        </v-btn>
                    </v-item-group>
                </span>
            </v-col>
            <v-col align="right" class="ma-0 pa-0">
                <span class="cmdButtonsZoom">
                    <v-item-group class="ma-0">
                        <v-btn
                            small
                            class="cmdButton"
                            :style="{
                                'background-color':
                                    currentZoomFactor == '1' ? 'var(--color-primary)' : 'rgba(0,0,0,0.8)',
                                color: currentZoomFactor == '1' ? 'var(--v-btn-text-primary)' : 'white',
                                'border-bottom-left-radius': '5px',
                                'min-width': '0px',
                            }"
                            @click="zoom('1')">
                            {{ $t('Panels.WebcamPanel.NozzleCalibrationOverlayZoom1X') }}
                        </v-btn>
                        <v-btn
                            small
                            class="cmdButton"
                            :style="{
                                'background-color':
                                    currentZoomFactor == '2' ? 'var(--color-primary)' : 'rgba(0,0,0,0.8)',
                                color: currentZoomFactor == '2' ? 'var(--v-btn-text-primary)' : 'white',
                            }"
                            @click="zoom('2')">
                            {{ $t('Panels.WebcamPanel.NozzleCalibrationOverlayZoom2X') }}
                        </v-btn>
                        <v-btn
                            small
                            class="cmdButton"
                            :style="{
                                'background-color':
                                    currentZoomFactor == maxZoomFactor ? 'var(--color-primary)' : 'rgba(0,0,0,0.8)',
                                color: currentZoomFactor == maxZoomFactor ? 'var(--v-btn-text-primary)' : 'white',
                            }"
                            @click="zoom('0')">
                            {{ $t('Panels.WebcamPanel.NozzleCalibrationOverlayZoomMAX') }}
                        </v-btn>
                        <v-btn
                            v-if="hasLED"
                            small
                            class="cmdButton"
                            :style="{
                                'background-color': isLEDTurnedOn ? 'var(--color-primary)' : 'rgba(0,0,0,0.8)',
                                color: isLEDTurnedOn ? 'var(--v-btn-text-primary)' : 'white',
                                'min-width': '0',
                            }"
                            @click="switchLED()">
                            <v-icon v-if="isLEDTurnedOn" small>
                                {{ mdiLightbulbOnOutline }}
                            </v-icon>
                            <v-icon v-else-if="!isLEDTurnedOn" small>
                                {{ mdiLightbulbOutline }}
                            </v-icon>
                        </v-btn>
                    </v-item-group>
                </span>
            </v-col>
        </v-row>
        <v-row v-if="isLoaded && nozzleCalib && bigEnough" align="bottom" class="ma-0 pa-0">
            <span class="cmdButtonsControl">
                <v-item-group class="ma-0">
                    <v-btn
                        small
                        :disabled="
                            isPrinting ||
                            !homedAxes.includes('xyz') ||
                            (isIdex && (idexMode == 'copy' || idexMode == 'mirror'))
                        "
                        class="cmdButton"
                        :style="{ 'background-color': 'rgba(0,0,0,0.8)', 'min-width': '0' }"
                        :loading="loadings.includes('set_cp')"
                        @click="doSet()">
                        {{ $t('Panels.WebcamPanel.NozzleCalibrationOverlaySet') }}
                    </v-btn>
                    <v-btn
                        small
                        class="cmdButton"
                        :disabled="
                            isPrinting ||
                            !homedAxes.includes('xyz') ||
                            (isIdex && (idexMode == 'copy' || idexMode == 'mirror'))
                        "
                        :style="{
                            'background-color': xyMoveMode ? 'var(--color-primary)' : 'rgba(0,0,0,0.8)',
                            color: xyMoveMode ? 'var(--v-btn-text-primary)' : 'white',
                        }"
                        @click="togglexyMove()">
                        {{
                            XYMoveOutput == 'MOVE'
                                ? $t('Panels.WebcamPanel.NozzleCalibrationOverlayMove')
                                : XYMoveOutput
                        }}
                    </v-btn>
                    <v-btn
                        v-if="hasZProbe"
                        small
                        class="cmdButton"
                        :disabled="
                            !allowZProbe ||
                            !homedAxes.includes('xyz') ||
                            (isIdex && (idexMode == 'copy' || idexMode == 'mirror'))
                        "
                        :style="{
                            'background-color': 'rgba(255,86,86,1.0)',
                            'min-width': '0',
                            'border-top-right-radius': '5px',
                        }"
                        @click="probeZ()">
                        {{ $t('Panels.WebcamPanel.NozzleCalibrationOverlayZProbe') }}
                    </v-btn>
                </v-item-group>
            </span>
        </v-row>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'
import ControlMixin from '@/components/mixins/control'
import { PrinterStateLight } from '@/store/printer/types'
import { mdiLightbulbOutline, mdiLightbulbOnOutline } from '@mdi/js'
import { PrinterStateToolchangeMacro } from '@/store/printer/types'

@Component
export default class MjpegstreamerAdaptive extends Mixins(BaseMixin, WebcamMixin, ControlMixin) {
    mdiLightbulbOutline = mdiLightbulbOutline
    mdiLightbulbOnOutline = mdiLightbulbOnOutline

    // eslint-disable-next-line no-undef
    private timer: NodeJS.Timeout | undefined = undefined

    declare $refs: {
        mjpegstreamerAdaptive: any
    }

    @Prop({ required: true }) declare camSettings: GuiWebcamStateWebcam
    @Prop({ default: null }) readonly printerUrl!: string | null
    @Prop({ default: true }) declare showFps: boolean

    // ----------------------------------------------
    // Printer
    // ----------------------------------------------
    get isPrinting(): boolean {
        return ['printing'].includes(this.printer_state)
    }

    get homedAxes(): string {
        return this.$store.state.printer?.toolhead?.homed_axes ?? ''
    }

    get activeTool(): string {
        let t = this.$store.state.printer.toolhead?.extruder.replace('extruder', 'T')
        if (t == 'T') t = t + '0'
        return t
    }

    get toolchangeMacros(): PrinterStateToolchangeMacro[] {
        return this.$store.getters['printer/getToolchangeMacros']
    }

    get activeExtruder(): string {
        return this.$store.state.printer.toolhead?.extruder
    }

    get nozzleDiameter(): number {
        return this.$store.state.printer.configfile?.settings?.[this.activeExtruder]?.nozzle_diameter ?? 0.4
    }

    get positionAbsolute() {
        return this.$store.state.printer.gcode_move?.absolute_coordinates ?? true
    }

    get livePositions() {
        const pos = this.$store.state.printer.motion_report?.live_position ?? [0, 0, 0]
        return {
            x: pos[0]?.toFixed(5) ?? '--',
            y: pos[1]?.toFixed(5) ?? '--',
            z: pos[2]?.toFixed(5) ?? '--',
        }
    }

    get gcodePositions() {
        const pos = this.$store.state.printer.gcode_move?.gcode_position ?? [0, 0, 0]
        return {
            x: pos[0]?.toFixed(5) ?? '--',
            y: pos[1]?.toFixed(5) ?? '--',
            z: pos[2]?.toFixed(5) ?? '--',
        }
    }

    get isIdex(): boolean {
        return 'dual_carriage' in this.$store.state.printer
    }

    get idexMode(): string {
        return this.$store.state.printer.dual_carriage?.carriage_1?.toString().toLowerCase()
    }

    // ----------------------------------------------
    // Nozzle Calibration
    // ----------------------------------------------
    private zProbeActive = false

    get allowZProbe(): boolean {
        return this.zProbeActive
    }

    probeZ() {
        this.zProbeActive = false
        this.doSend('_NOZZLE_CALIBRATION_PROBE_Z_OFFSET')
    }

    doSet() {
        this.zProbeActive = true
        this.xyMove = false
        this.dragStart = { x: 0, y: 0 }
        this.distancePixels = { x: 0, y: 0 }
        this.distanceMM = { x: 0, y: 0 }
        this.doSend('_NOZZLE_CALIBRATION_SET_TOOL')
    }

    doT(gcode: string) {
        this.zProbeActive = false
        this.xyMove = false
        this.dragStart = { x: 0, y: 0 }
        this.distancePixels = { x: 0, y: 0 }
        this.distanceMM = { x: 0, y: 0 }
        this.doSend(gcode)
    }

    get hasZProbe(): boolean {
        try {
            const zoffsetprobe = this.$store.state.printer.configfile?.settings?.zoffsetprobe
            if (zoffsetprobe.z_offset > 0) return true
            return false
        } catch {
            return false
        }
    }

    get nozzleCalib() {
        return this.camSettings.extra_data?.nozzle_calibration ?? false
    }

    get bigEnough() {
        let canvas = this.$refs.mjpegstreamerAdaptive
        return canvas?.clientWidth >= 480
    }

    // ----------------------------------------------
    // Nozzle LED
    // ----------------------------------------------
    private ledActive = 0
    switchLED() {
        this.ledActive = this.ledActive == 0 ? 1 : 0
        this.doSend('_NOZZLE_CALIBRATION_SWITCH_LED STATE=' + this.ledActive)
    }

    get lights() {
        return this.$store.getters['printer/getLights'] ?? []
    }

    get hasLED(): boolean {
        try {
            let nozzle_calibration_led = this.lights.filter((light: PrinterStateLight) =>
                light.name.includes('nozzle_calibration_led')
            )
            return nozzle_calibration_led?.length == 1
        } catch {
            return false
        }
    }

    get isLEDTurnedOn(): boolean {
        return this.ledActive == 1
    }

    // ----------------------------------------------
    // Webcam
    // ----------------------------------------------
    private imageOffsetX = 0
    private imageOffsetY = 0
    private imageStartX = 0
    private imageStartY = 0
    private imageSizeX = 0
    private imageSizeY = 0
    private aspectRatio: null | number = null
    private refresh = Math.ceil(Math.random() * Math.pow(10, 12))

    loadImage(url: string) {
        return new Promise((r) => {
            let image = new Image()
            image.onload = () => r(image)
            image.onerror = () => setTimeout(this.refreshFrame, 1000)
            image.src = url
        })
    }

    startStream() {
        if (this.isVisible) return
        this.isVisible = true
        this.refreshFrame()
    }

    stopStream() {
        this.isVisible = false
        clearTimeout(this.timer)
        this.timer = undefined
    }

    refreshFrame() {
        if (this.isVisible) {
            this.refresh = new Date().getTime()
            this.setFrame()
        }
    }

    async setFrame() {
        const baseUrl = this.camSettings.snapshot_url

        let url = new URL(baseUrl, this.printerUrl === null ? this.hostUrl.toString() : this.printerUrl)
        if (baseUrl.startsWith('http') || baseUrl.startsWith('://')) url = new URL(baseUrl)

        url.searchParams.append('bypassCache', this.refresh.toString())

        this.request_start_time = performance.now()
        this.currentFPS = this.time > 0 ? Math.round(1000 / this.time) : 0

        let canvas = this.$refs.mjpegstreamerAdaptive
        if (canvas) {
            const ctx = canvas.getContext('2d')
            const frame: any = await this.loadImage(url.toString())

            canvas.width = canvas.clientWidth
            if (this.rotate) {
                if (this.aspectRatio === null) this.aspectRatio = frame.height / frame.width
                canvas.height = canvas.clientWidth / this.aspectRatio
            } else {
                if (this.aspectRatio === null) this.aspectRatio = frame.width / frame.height
                canvas.height = canvas.clientWidth / this.aspectRatio
            }

            let imgWidth = frame.width
            let imgHeight = frame.height
            if (this.rotate) {
                imgWidth = frame.height
                imgHeight = frame.width
            }

            // calculate max zoom
            if (this.zoomFactor == 0) {
                this.zoomFactor = (this.rotate ? imgWidth : imgHeight) / (1.4 * this.pixelPerMM)
                this.zoomFactorMax = this.zoomFactor
            }

            // get image offset
            this.imageOffsetX = this.canvasPixelToFramePixel(this.distancePixels.x)
            this.imageOffsetY = this.canvasPixelToFramePixel(this.distancePixels.y)

            if (this.rotate) {
                let scale = (canvas.height / frame.width) * this.zoomFactor

                let x = canvas.width / 2 + this.imageOffsetX
                let y = canvas.height / 2 + this.imageOffsetY

                let x1 = (-frame.width / 2) * scale
                let y1 = (-frame.height / 2) * scale
                let x2 = frame.width * scale
                let y2 = frame.height * scale

                ctx.translate(x, y)
                ctx.rotate((this.camSettings.rotation * Math.PI) / 180)
                await ctx?.drawImage(frame, x1, y1, x2, y2)
                ctx.rotate(-((this.camSettings.rotation * Math.PI) / 180))
                ctx.translate(-x, -y)
            } else {
                // get frame to canvas pixel ratio
                this.pixelRatio = imgWidth / canvas.width

                // get image start XY coordinates
                this.imageStartX = (imgWidth - imgWidth / this.zoomFactor) / 2 - this.imageOffsetX
                this.imageStartY = (imgHeight - imgHeight / this.zoomFactor) / 2 - this.imageOffsetY

                // get image size
                this.imageSizeX = imgWidth / this.zoomFactor
                this.imageSizeY = imgHeight / this.zoomFactor

                await ctx?.drawImage(
                    frame,
                    this.imageStartX,
                    this.imageStartY,
                    this.imageSizeX,
                    this.imageSizeY,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                )
            }

            if (this.nozzleCalib) this.drawOverlay(ctx, canvas)

            this.isLoaded = true
        }

        this.$nextTick(() => {
            this.onLoad()
        })
    }

    @Watch('camSettings', { immediate: true, deep: true })
    camSettingsChanged() {
        this.aspectRatio = null
    }

    get rotate() {
        return [90, 270].includes(this.camSettings.rotation ?? 0)
    }

    get showFpsCounter() {
        if (!this.showFps) return false

        return !(this.camSettings.extra_data?.hideFps ?? false)
    }

    get pixelPerMM() {
        return this.camSettings.extra_data?.pixel_per_mm ?? 0
    }

    get webcamStyle() {
        const output = {
            transform: this.generateTransform(
                this.camSettings.flip_horizontal ?? false,
                this.camSettings.flip_vertical ?? false,
                this.camSettings.rotation ?? 0
            ),
            aspectRatio: 16 / 9,
            maxHeight: window.innerHeight - 155 + 'px',
            maxWidth: 'auto',
        }

        if (this.aspectRatio) {
            output.aspectRatio = this.aspectRatio
            output.maxWidth = (window.innerHeight - 155) * this.aspectRatio + 'px'
        }

        return output
    }

    private currentFPS = 0
    get fpsOutput() {
        return `${this.currentFPS < 10 ? '0' + this.currentFPS.toString() : this.currentFPS}`
    }

    // ----------------------------------------------
    // Nozzle Calibration Overlay
    // ----------------------------------------------
    private zoomFactor = 1
    private zoomFactorMax = -1

    async drawOverlay(ctx: any, canvas: any) {
        // canvas center
        let canvasCenterX = Math.round(canvas.width / 2)
        let canvasCenterY = Math.round(canvas.height / 2)

        // ----------------------------------------------------------------
        // Overlay
        // ----------------------------------------------------------------
        await ctx?.beginPath()
        ctx.lineWidth = 3
        ctx.fillStyle = 'transparent'
        ctx.strokeStyle = this.isPrinting || !this.homedAxes.includes('xyz') ? '#aaaaaa' : this.primaryColor

        // ----------------------------------------------------------------
        // draw crosshairs circles
        // ----------------------------------------------------------------
        let innerCircleRX = canvas.width / (this.imageSizeX / (this.nozzleDiameter * this.pixelPerMM)) / 2
        let innerCircleRY = canvas.height / (this.imageSizeY / (this.nozzleDiameter * this.pixelPerMM)) / 2
        let outerCircleRX = canvas.width / (this.imageSizeX / (1.0 * this.pixelPerMM)) / 2
        let outerCircleRY = canvas.height / (this.imageSizeY / (1.0 * this.pixelPerMM)) / 2
        await ctx?.ellipse(canvasCenterX, canvasCenterY, innerCircleRX, innerCircleRY, 0, 0, 360)
        await ctx?.ellipse(canvasCenterX, canvasCenterY, outerCircleRX, outerCircleRY, 0, 0, 360)
        await ctx?.fill()

        // ----------------------------------------------------------------
        // draw crosshairs lines
        // ----------------------------------------------------------------
        let crosshairsLengthX = Math.round(canvas.width / (this.imageSizeX / (1.5 * this.pixelPerMM)))
        let crosshairsLengthY = Math.round(canvas.height / (this.imageSizeY / (1.5 * this.pixelPerMM)))
        await ctx?.moveTo(canvasCenterX, canvasCenterY - crosshairsLengthY / 2)
        await ctx?.lineTo(canvasCenterX, canvasCenterY + crosshairsLengthY / 2)
        await ctx?.moveTo(canvasCenterX - Math.round(crosshairsLengthX / 2), canvasCenterY)
        await ctx?.lineTo(canvasCenterX + Math.round(crosshairsLengthX / 2), canvasCenterY)

        await ctx?.stroke()
        this.isLoaded = true
    }

    canvasPixelToFramePixel(canvasPixel: any): number {
        return (canvasPixel * this.pixelRatio) / this.zoomFactor
    }

    canvasPixelToMM(canvasPixel: any): number {
        // mm to canvas pixel          (canvas.width / (imageSizeX / pixelPerMM) / 2)
        return this.canvasPixelToFramePixel(Math.abs(canvasPixel) / this.pixelPerMM)
    }

    mmToCanvasPixel(canvas: any, mm: any): number {
        return canvas.width / (mm / this.pixelPerMM) / 2
    }

    zoom(zoom: string): void {
        let z = Number(zoom)
        this.zoomFactor = z
        this.zoomFactorMax = -1
        this.dragStart = { x: 0, y: 0 }
        this.distancePixels = { x: 0, y: 0 }
        this.distanceMM = { x: 0, y: 0 }
    }

    get currentZoomFactor() {
        return this.zoomFactor.toString()
    }

    get maxZoomFactor() {
        return this.zoomFactorMax.toString()
    }

    // ----------------------------------------------
    // Drag and Drop
    // ----------------------------------------------
    private pixelRatio = 1
    private isDragging = false
    private dragStart = { x: 0, y: 0 }
    private distanceMM = { x: 0, y: 0 }
    private distancePixels = { x: 0, y: 0 }
    private xyMove = false

    togglexyMove() {
        this.zProbeActive = false
        this.xyMove = !this.xyMove
        this.dragStart = { x: 0, y: 0 }
        this.distancePixels = { x: 0, y: 0 }
        this.distanceMM = { x: 0, y: 0 }
    }

    getEventLocation(e: any) {
        let canvas = this.$refs.mjpegstreamerAdaptive
        const rect = canvas.getBoundingClientRect()
        return { x: e?.clientX - rect.left, y: e?.clientY - rect.top }
    }

    onPointerDown(e: any) {
        if (this.xyMove) {
            this.isDragging = true
            this.dragStart.x = this.getEventLocation(e).x - this.distancePixels.x
            this.dragStart.y = this.getEventLocation(e).y - this.distancePixels.y
        }
    }

    onPointerUp(e: any) {
        this.isDragging = false
        if (this.xyMove) {
            if (!this.isPrinting && this.homedAxes.includes('xyz')) {
                let x =
                    this.dragStart.x < this.getEventLocation(e).x
                        ? Math.abs(this.distanceMM.x)
                        : -Math.abs(this.distanceMM.x)
                let y =
                    this.dragStart.y < this.getEventLocation(e).y
                        ? -Math.abs(this.distanceMM.y)
                        : Math.abs(this.distanceMM.y)
                this.doSendMove(`X${x.toFixed(5)} Y${y.toFixed(5)}`, 300)
                this.doSend('G90')
            }
            this.dragStart = { x: 0, y: 0 }
            this.distancePixels = { x: 0, y: 0 }
            this.distanceMM = { x: 0, y: 0 }
        }
    }

    onPointerMove(e: any) {
        if (this.isDragging && this.xyMove) {
            this.distancePixels.x = this.getEventLocation(e).x - this.dragStart.x
            this.distancePixels.y = this.getEventLocation(e).y - this.dragStart.y
            this.distanceMM.x = this.canvasPixelToMM(this.distancePixels.x)
            this.distanceMM.y = this.canvasPixelToMM(this.distancePixels.y)
            if (this.nozzleFlipX) this.distancePixels.x = -this.distancePixels.x
            if (this.nozzleFlipY) this.distancePixels.y = -this.distancePixels.y
        }
    }

    get xyMoveMode(): boolean {
        return this.xyMove
    }

    get XYMoveOutput() {
        if (this.xyMove && !this.isPrinting && this.homedAxes.includes('xyz')) {
            return 'Y:' + this.gcodePositions.x.toString() + ' - X:' + this.gcodePositions.y.toString()
        }
        return 'MOVE'
    }

    get nozzleFlipX() {
        return this.camSettings.extra_data?.nozzle_flip_x ?? false
    }

    get nozzleFlipY() {
        return this.camSettings.extra_data?.nozzle_flip_y ?? false
    }

    // ----------------------------------------------
    // Events
    // ----------------------------------------------
    private time = 0
    private request_time = 0
    private time_smoothing = 0.6
    private request_time_smoothing = 0.1
    private isVisible = true
    private isVisibleDocument = true
    private isVisibleViewport = false
    private isLoaded = false
    private start_time = performance.now()
    private request_start_time = performance.now()

    onLoad() {
        this.isLoaded = true

        const targetFps = this.camSettings.target_fps || 10
        const end_time = performance.now()
        const current_time = end_time - this.start_time
        this.time = this.time * this.time_smoothing + current_time * (1.0 - this.time_smoothing)
        this.start_time = end_time

        const target_time = 1000 / targetFps

        const current_request_time = performance.now() - this.request_start_time
        this.request_time =
            this.request_time * this.request_time_smoothing + current_request_time * (1.0 - this.request_time_smoothing)
        const timeout = Math.max(0, target_time - this.request_time)

        this.$nextTick(() => {
            this.timer = setTimeout(this.refreshFrame, timeout)
        })
    }

    mounted() {
        let canvas = this.$refs.mjpegstreamerAdaptive
        canvas.addEventListener('mousedown', this.onPointerDown)
        canvas.addEventListener('mouseup', this.onPointerUp)
        canvas.addEventListener('mousemove', this.onPointerMove)
        document.addEventListener('visibilitychange', this.documentVisibilityChanged)
        this.refreshFrame()
    }

    beforeDestroy() {
        let canvas = this.$refs.mjpegstreamerAdaptive
        canvas.removeEventListener('mousedown', this.onPointerDown)
        canvas.removeEventListener('mouseup', this.onPointerUp)
        canvas.removeEventListener('mousemove', this.onPointerMove)
        document.removeEventListener('visibilitychange', this.documentVisibilityChanged)
    }

    documentVisibilityChanged() {
        const visibility = document.visibilityState
        this.isVisibleDocument = visibility === 'visible'
        if (!this.isVisibleDocument) this.stopStream()
        this.visibilityChanged()
    }

    viewportVisibilityChanged(newVal: boolean) {
        this.isVisibleViewport = newVal
        this.visibilityChanged()
    }

    visibilityChanged() {
        if (this.isVisibleViewport && this.isVisibleDocument) {
            this.startStream()
            return
        }

        this.stopStream()
    }

    // ----------------------------------------------
    // Common
    // ----------------------------------------------
    doSend(gcode: string): void {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: gcode.toLowerCase() })
    }

    get primaryColor(): string {
        return this.$store.state.gui.uiSettings.primary
    }
}
</script>

<style scoped>
.webcamImage {
    width: 100%;
}

.webcamFpsOutput {
    display: inline-block;
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    padding: 3px 10px;
    border-top-left-radius: 5px;
}

.cmdButtonsTools {
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    padding: 0px 0px;
    margin-right: 200px;
}

.cmdButtonsZoom {
    display: inline-block;
    position: absolute;
    top: 0;
    right: 0;
    padding: 0px 0px;
}

.cmdButtonsControl {
    display: inline-block;
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0px 0px;
}

.cmdButton {
    margin: 0px;
    padding: 0px;
    border-radius: 0;
    border-width: 0;
    box-shadow: none;
    font-size: 0.8rem !important;
    height: 28px;
    max-height: 28px;
}
</style>

<style lang="scss" scoped>
._btn-group {
    .v-btn {
        border-radius: 0;
    }

    .v-btn:first-child {
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
    }

    .v-btn:last-child {
        border-top-right-radius: inherit;
        border-bottom-right-radius: 5px;
    }
}
</style>
