<template>
    <panel
        :icon="mdiVideo2d"
        :title="$t('Panels.GcodePreviewPanel.Headline')"
        card-class="gcode-preview-panel"
        :loading="loading">
        <template #buttons>
            <v-btn icon tile :disabled="!sdCardFilePath" @click="loadFile(true)">
                <v-icon>{{ mdiRefresh }}</v-icon>
            </v-btn>
        </template>
        <v-card-text :class="hasFile && !error ? 'gcode-preview-content' : ''">
            <p v-if="error" class="text-center mb-0 text--disabled">{{ error }}</p>
            <p v-else-if="!hasFile" class="text-center mb-0 text--disabled">
                {{ $t('Panels.GcodePreviewPanel.NoFile') }}
            </p>
            <template v-else>
                <div class="gcode-preview-toolbar">
                    <div class="gcode-preview-toggles">
                        <v-checkbox
                            v-model="showPrintPreview"
                            :label="$t('Panels.GcodePreviewPanel.PrintPreview')"
                            hide-details
                            dense />
                        <v-checkbox
                            v-model="showMovePath"
                            :label="$t('Panels.GcodePreviewPanel.ShowMovePath')"
                            hide-details
                            dense />
                    </div>
                    <div class="gcode-preview-layer-label">{{ layerLabel }}</div>
                </div>
                <gcode-preview-chart
                    :runs="currentLayerRuns"
                    :show-remaining="showPrintPreview"
                    :travels="showMovePath ? currentLayerTravels : []"
                    :progress-offset="fileProgressOffset"
                    :tool-position="toolPositionXY"
                    :bed-min="bedMin"
                    :bed-max="bedMax"
                    :tool-on-layer="toolOnLayer"
                    @click.native="showDialog = true" />
                <gcode-preview-dialog
                    v-model="showDialog"
                    :runs="currentLayerRuns"
                    :travels="showMovePath ? currentLayerTravels : []"
                    :progress-offset="fileProgressOffset"
                    :tool-position="toolPositionXY"
                    :bed-min="bedMin"
                    :bed-max="bedMax"
                    :tool-on-layer="toolOnLayer"
                    :layer-label="layerLabel"
                    :show-print-preview.sync="showPrintPreview"
                    :show-move-path.sync="showMovePath" />
            </template>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import GcodePreviewChart from '@/components/charts/GcodePreviewChart.vue'
import GcodePreviewDialog from '@/components/dialogs/GcodePreviewDialog.vue'
import GcodePreviewWorker from './GcodePreview/gcodePreview.worker?worker'
import type { GcodePreviewWorkerOutMessage } from './GcodePreview/gcodePreview.worker'
import { closestPointOnSegment, GcodePreviewLayer, GcodePreviewRun } from './GcodePreview/parser'
import { escapePath } from '@/plugins/helpers'
import axios, { CancelTokenSource } from 'axios'
import { mdiRefresh, mdiVideo2d } from '@mdi/js'

const MAX_FILE_SIZE_BYTES = 80 * 1024 * 1024

// live Z includes bed-mesh compensation (up to a full layer height on this bed), so "at
// the path's Z" can't be an absolute tolerance. The offset live Z - segment Z is learned
// while the nozzle is on a printed segment, and a z-hop is a rise past this fraction of
// the layer spacing above that learned offset. Mesh drift between samples is far smaller.
const LIFT_FRACTION_OF_LAYER = 0.5
const DEFAULT_LAYER_SPACING_MM = 0.2

// the nozzle is on a layer when an already-read printed segment of it is within this XY
// tolerance (the same one the chart uses) *and* at its Z. Neither alone is enough: walls
// stack, so every layer has a segment under the nozzle, and a 1 mm z-hop on 0.1 mm layers
// lands exactly on another layer's Z.
const LAYER_XY_TOLERANCE_MM = 2
const LAYER_XY_SCAN_POINTS = 4000

// Klipper reports the extruder's live velocity; above this it's laying plastic down. A
// travel that doesn't z-hop (short moves under the retract distance) stays at layer Z and
// passes within tolerance of printed lines, and only this tells it apart from extrusion.
const EXTRUDER_MOVING_MM_S = 0.01

// motion_report updates that may disagree with the learned Z offset before it's taken
// again - about a second. Until live Z has matched a layer the panel goes by the read
// position, which for the last seconds of every layer is already a layer ahead, and a lock
// taken against that layer would make every real sample look like a lift.
const Z_OFFSET_RELOCK_SAMPLES = 4

@Component({
    components: { Panel, GcodePreviewChart, GcodePreviewDialog },
})
export default class GcodePreviewPanel extends Mixins(BaseMixin) {
    mdiRefresh = mdiRefresh
    mdiVideo2d = mdiVideo2d

    loading = false
    error: string | null = null
    layers: GcodePreviewLayer[] = []
    loadedFilename: string | null = null
    showDialog = false
    // the layer the nozzle was last seen printing (by live Z); null until it matches one
    liveLayerIndex: number | null = null
    // learned live Z - segment Z while on a printed segment: bed mesh plus whatever else
    // Klipper adds that the gcode doesn't know about. null until the first on-path sample
    zOffsetEstimate: number | null = null
    // consecutive on-path samples off the estimate that no layer switch explained
    zOffsetMismatches = 0

    private worker: Worker | null = null
    private cancelTokenSource: CancelTokenSource | null = null
    private loadCounter = 0

    // both toggles persist through gui settings, so they survive a reload like the
    // rest of the dashboard's per-panel preferences
    get showPrintPreview(): boolean {
        return this.$store.state.gui.gcodePreview?.showPrintPreview ?? true
    }

    set showPrintPreview(value: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodePreview.showPrintPreview', value })
    }

    get showMovePath(): boolean {
        return this.$store.state.gui.gcodePreview?.showMovePath ?? false
    }

    set showMovePath(value: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'gcodePreview.showMovePath', value })
    }

    get sdCardFilePath(): string {
        return this.$store.state.printer.print_stats?.filename ?? ''
    }

    get hasFile(): boolean {
        return this.layers.length > 0
    }

    // once a print isn't actively running/paused, treat the whole path as completed
    get fileProgressOffset(): number {
        if (!this.printerIsPrinting) return Number.MAX_SAFE_INTEGER

        return this.$store.state.printer.virtual_sdcard?.file_position ?? 0
    }

    // a layer's own runs are always in increasing offset order (the file is scanned
    // top to bottom), so its first/last point give the layer's offset range for free
    get layerStartOffsets(): number[] {
        return this.layers.map((layer) => layer.runs[0]?.[0]?.offset ?? 0)
    }

    // the layer the nozzle is actually on wins. The file position runs a whole lookahead
    // queue ahead of the head, so it flips to the next layer while the last perimeters of
    // this one are still being laid down - and the head then wanders over paths that
    // aren't its own. Fall back to the file position only until live Z has matched a layer.
    get currentLayerIndex(): number {
        if (this.liveLayerIndex !== null && this.liveLayerIndex < this.layers.length) return this.liveLayerIndex

        const progress = this.fileProgressOffset
        for (let i = this.layerStartOffsets.length - 1; i >= 0; i--) {
            if (progress >= this.layerStartOffsets[i]) return i
        }
        return 0
    }

    get liveZ(): number | null {
        if (!this.printerIsPrinting) return null

        return this.livePosition[2] - (this.gcodeOffset[2] ?? 0)
    }

    // smallest step between consecutive layer Zs, so the lift threshold scales with the file
    get layerSpacing(): number {
        let spacing = Number.POSITIVE_INFINITY
        for (let i = 1; i < this.layers.length; i++) {
            const step = this.layers[i].z - this.layers[i - 1].z
            if (step > 0 && step < spacing) spacing = step
        }
        return Number.isFinite(spacing) ? spacing : DEFAULT_LAYER_SPACING_MM
    }

    get liftThreshold(): number {
        return this.layerSpacing * LIFT_FRACTION_OF_LAYER
    }

    // the layer with an already-read printed segment under the nozzle at the nozzle's Z (mesh
    // offset removed). Walls stack, so several layers can have a segment there, and the one
    // whose Z fits best wins - the current layer only keeps precedence on a tie, which is
    // where its seam's end ramp meets the next layer's start. -1 while lifted, off every path,
    // or before the offset is known. Never an *earlier* layer than the current one: the file
    // only moves forward, and a Z below the current layer while extruding is a scarf seam
    // ramping down, not a return to the layer underneath
    findLayerAtZ(z: number): number {
        if (this.zOffsetEstimate === null || !this.toolExtruding) return -1

        const corrected = z - this.zOffsetEstimate
        let best = -1
        let bestError = this.liftThreshold
        for (let i = this.liveLayerIndex ?? 0; i < this.layers.length; i++) {
            // nothing past the read position has been printed yet
            if (this.layerStartOffsets[i] > this.fileProgressOffset) break

            const segmentZ = this.onPathSegmentZ(this.layers[i], corrected)
            if (segmentZ === null) continue

            const error = Math.abs(segmentZ - corrected)
            if (error < bestError) {
                best = i
                bestError = error
            }
        }
        return best
    }

    // the Z of the layer's already-read printed segment under the nozzle, interpolated along
    // it - the one nearest `target` where several overlap in XY (a scarf seam's end ramps down
    // over its own start). null when no read segment is within tolerance
    onPathSegmentZ(layer: GcodePreviewLayer, target: number | null): number | null {
        const tool = this.toolPositionXY
        if (!tool) return null

        const readLimit = this.fileProgressOffset
        const toleranceSq = LAYER_XY_TOLERANCE_MM * LAYER_XY_TOLERANCE_MM
        let best: number | null = null
        let scanned = 0
        for (const run of layer.runs) {
            for (let i = 0; i + 1 < run.length && scanned < LAYER_XY_SCAN_POINTS; i++, scanned++) {
                // runs are in file order, so past the read limit nothing later is printed yet
                if (run[i].offset > readLimit) return best
                const { distanceSq, t } = closestPointOnSegment(tool, run[i], run[i + 1])
                if (distanceSq > toleranceSq) continue

                const z = run[i].z + (run[i + 1].z - run[i].z) * t
                if (target === null) return z
                if (best === null || Math.abs(z - target) < Math.abs(best - target)) best = z
            }
        }
        return best
    }

    get layerLabel(): string {
        return this.$t('Panels.GcodePreviewPanel.Layer', {
            current: this.currentLayerIndex + 1,
            total: this.layers.length,
        }).toString()
    }

    get currentLayerRuns(): GcodePreviewRun[] {
        return this.layers[this.currentLayerIndex]?.runs ?? []
    }

    get currentLayerTravels(): GcodePreviewRun[] {
        return this.layers[this.currentLayerIndex]?.travels ?? []
    }

    get bedMin(): number[] {
        return this.$store.state.printer.toolhead?.axis_minimum ?? [0, 0]
    }

    get bedMax(): number[] {
        return this.$store.state.printer.toolhead?.axis_maximum ?? [200, 200]
    }

    get gcodeOffset(): number[] {
        return this.$store.state.printer.gcode_move?.homing_origin ?? [0, 0]
    }

    get livePosition(): number[] {
        return this.$store.state.printer.motion_report?.live_position ?? [0, 0, 0, 0]
    }

    get toolExtruding(): boolean {
        return (this.$store.state.printer.motion_report?.live_extruder_velocity ?? 0) > EXTRUDER_MOVING_MM_S
    }

    get toolPositionXY(): [number, number] | null {
        if (!this.printerIsPrinting) return null

        return [this.livePosition[0] - this.gcodeOffset[0], this.livePosition[1] - this.gcodeOffset[1]]
    }

    // the nozzle is at the Z of the drawn layer's path under it, i.e. not lifted for a travel -
    // without this the chart would treat XY nearness to a printed segment as being on it
    get toolOnLayer(): boolean {
        const z = this.liveZ
        const layer = this.layers[this.currentLayerIndex]
        if (z === null || !layer || this.zOffsetEstimate === null || !this.toolExtruding) return false

        const corrected = z - this.zOffsetEstimate
        const segmentZ = this.onPathSegmentZ(layer, corrected)
        return segmentZ !== null && Math.abs(segmentZ - corrected) <= this.liftThreshold
    }

    @Watch('sdCardFilePath')
    sdCardFilePathChanged(newVal: string): void {
        if (newVal === '' || !this.printerIsPrinting) return

        this.loadFile()
    }

    // every motion_report update, not only Z changes: the nozzle is lowered onto the next
    // layer *before* it starts extruding there, and a layer switch is only taken while
    // extruding - keyed to Z alone it would wait for the first mesh wobble on the new layer
    @Watch('livePosition')
    livePositionChanged(): void {
        const z = this.liveZ
        if (z === null) {
            this.liveLayerIndex = null
            this.zOffsetEstimate = null
            this.zOffsetMismatches = 0
            return
        }

        // switch first, so the sample is learned against the layer it was printed on
        const index = this.findLayerAtZ(z)
        if (index !== -1 && index !== this.liveLayerIndex) {
            this.liveLayerIndex = index
            this.zOffsetMismatches = 0
        }
        this.learnZOffset(z)
    }

    // while the nozzle is on a printed segment of the drawn layer, live Z - that segment's Z
    // is the mesh plus whatever else Klipper adds. Compared to the *segment*, not the layer, a
    // scarf seam's ramp is expected rather than learned: it would otherwise walk the offset a
    // whole layer up in sub-threshold steps. Once locked, a sample off by more than the lift
    // threshold is a lift, or a layer the switch hasn't caught up with - unless it persists,
    // in which case the lock itself was taken against the wrong layer and is taken again.
    learnZOffset(z: number): void {
        const layer = this.layers[this.currentLayerIndex]
        if (!layer || !this.toolExtruding) return

        const estimate = this.zOffsetEstimate
        const segmentZ = this.onPathSegmentZ(layer, estimate === null ? null : z - estimate)
        if (segmentZ === null) return

        const observed = z - segmentZ
        if (estimate !== null && Math.abs(observed - estimate) > this.liftThreshold) {
            if (++this.zOffsetMismatches < Z_OFFSET_RELOCK_SAMPLES) return
        }

        this.zOffsetEstimate = observed
        this.zOffsetMismatches = 0
    }

    // print_stats.filename survives the end of a job, so without this the panel keeps
    // showing the finished file's toolpath - and reloads it on mount - until the next
    // print starts. A job that stops for any reason clears the preview instead.
    @Watch('printerIsPrinting')
    printerIsPrintingChanged(isPrinting: boolean): void {
        if (isPrinting) {
            if (this.sdCardFilePath) this.loadFile()
            return
        }

        this.clearPreview()
    }

    mounted(): void {
        if (this.printerIsPrinting && this.sdCardFilePath) this.loadFile()
    }

    beforeDestroy(): void {
        this.cancelTokenSource?.cancel('component destroyed')
        this.worker?.terminate()
    }

    private clearPreview(): void {
        // bump the load id so an in-flight download or worker result can't repopulate it
        this.loadCounter++
        this.cancelTokenSource?.cancel('print ended')
        this.worker?.terminate()
        this.worker = null

        this.layers = []
        this.liveLayerIndex = null
        this.zOffsetEstimate = null
        this.zOffsetMismatches = 0
        this.loadedFilename = null
        this.error = null
        this.loading = false
        this.showDialog = false
    }

    async loadFile(force = false): Promise<void> {
        const filename = this.sdCardFilePath
        if (!filename) return
        if (!force && filename === this.loadedFilename) return

        this.cancelTokenSource?.cancel('superseded by newer load')
        this.worker?.terminate()
        this.worker = null

        this.loading = true
        this.error = null
        this.layers = []
        this.liveLayerIndex = null
        this.zOffsetEstimate = null
        this.zOffsetMismatches = 0

        // cancelling can't call back an already-fulfilled request, so every load carries
        // an id and anything that isn't the newest one is dropped on arrival
        const loadId = ++this.loadCounter
        const cancelTokenSource = axios.CancelToken.source()
        this.cancelTokenSource = cancelTokenSource
        const url = this.apiUrl + '/server/files/' + escapePath('gcodes/' + filename)

        try {
            // check the size before pulling the body down, so an oversized file isn't
            // buffered into memory just to be rejected afterwards
            const head = await axios.head(url, { cancelToken: cancelTokenSource.token })
            if (loadId !== this.loadCounter) return

            const contentLength = Number(head.headers['content-length'] ?? 0)
            if (contentLength > MAX_FILE_SIZE_BYTES) {
                this.error = this.$t('Panels.GcodePreviewPanel.FileTooLarge').toString()
                this.loading = false
                return
            }

            const response = await axios.get<string>(url, {
                cancelToken: cancelTokenSource.token,
                responseType: 'text',
            })
            if (loadId !== this.loadCounter) return

            if (response.data.length > MAX_FILE_SIZE_BYTES) {
                this.error = this.$t('Panels.GcodePreviewPanel.FileTooLarge').toString()
                this.loading = false
                return
            }

            this.parseInWorker(response.data, filename, loadId)
        } catch (e) {
            if (axios.isCancel(e) || loadId !== this.loadCounter) return

            this.error = this.$t('Panels.GcodePreviewPanel.LoadError').toString()
            this.loading = false
        }
    }

    private parseInWorker(text: string, filename: string, loadId = this.loadCounter): void {
        const bedSizeMm = Math.max(this.bedMax[0] - this.bedMin[0], this.bedMax[1] - this.bedMin[1])

        const worker = new GcodePreviewWorker()
        this.worker = worker

        worker.onmessage = (event: MessageEvent<GcodePreviewWorkerOutMessage>) => {
            // a worker from a superseded load must not overwrite the current preview
            if (loadId !== this.loadCounter) {
                worker.terminate()
                return
            }

            if (event.data.type === 'result') {
                // frozen: a sliced file is easily 100k+ points, and Vue would otherwise
                // deep-walk every one of them installing reactivity we never need - the
                // parsed result is replaced wholesale, never mutated in place
                this.layers = Object.freeze(event.data.layers) as GcodePreviewLayer[]
                this.loadedFilename = filename
            } else {
                this.error = event.data.message
            }

            this.loading = false
            worker.terminate()
            if (this.worker === worker) this.worker = null
        }

        worker.postMessage({ type: 'parse', text, bedSizeMm })
    }
}
</script>

<style scoped>
.gcode-preview-content {
    padding: 10px;
}

/* the chart itself is the click target for the enlarged dialog */
.gcode-preview-content ::v-deep .gcode-preview-svg {
    cursor: pointer;
}

/* the whole row stays on one line at dashboard column width: nothing wraps, and the
   labels shrink rather than pushing the layer badge onto a second line */
.gcode-preview-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    flex: 0 0 auto;
    flex-wrap: nowrap;
    gap: 8px;
}

.gcode-preview-toggles {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.gcode-preview-toolbar ::v-deep .v-input--checkbox {
    margin-top: 0;
    padding-top: 0;
}

.gcode-preview-toolbar ::v-deep .v-label {
    font-size: 0.75rem;
    white-space: nowrap;
}

.gcode-preview-toolbar ::v-deep .v-input--selection-controls__input {
    margin-right: 4px;
}

.gcode-preview-toolbar ::v-deep .v-input--selection-controls__input .v-icon {
    font-size: 18px;
}

.gcode-preview-layer-label {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    flex: 0 0 auto;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
}
</style>
