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
            <gcode-preview-chart
                v-else
                :runs="runs"
                :progress-offset="fileProgressOffset"
                :tool-position="toolPositionXY"
                :bed-min="bedMin"
                :bed-max="bedMax" />
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import GcodePreviewChart from '@/components/charts/GcodePreviewChart.vue'
import GcodePreviewWorker from './GcodePreview/gcodePreview.worker?worker'
import type { GcodePreviewWorkerOutMessage } from './GcodePreview/gcodePreview.worker'
import { GcodePreviewRun } from './GcodePreview/parser'
import { escapePath } from '@/plugins/helpers'
import axios, { CancelTokenSource } from 'axios'
import { mdiRefresh, mdiVideo2d } from '@mdi/js'

const MAX_FILE_SIZE_BYTES = 80 * 1024 * 1024

@Component({
    components: { Panel, GcodePreviewChart },
})
export default class GcodePreviewPanel extends Mixins(BaseMixin) {
    mdiRefresh = mdiRefresh
    mdiVideo2d = mdiVideo2d

    loading = false
    error: string | null = null
    runs: GcodePreviewRun[] = []
    loadedFilename: string | null = null

    private worker: Worker | null = null
    private cancelTokenSource: CancelTokenSource | null = null

    get sdCardFilePath(): string {
        return this.$store.state.printer.print_stats?.filename ?? ''
    }

    get hasFile(): boolean {
        return this.runs.length > 0
    }

    // once a print isn't actively running/paused, treat the whole path as completed
    get fileProgressOffset(): number {
        if (!this.printerIsPrinting) return Number.MAX_SAFE_INTEGER

        return this.$store.state.printer.virtual_sdcard?.file_position ?? 0
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

    get toolPositionXY(): [number, number] | null {
        if (!this.printerIsPrinting) return null

        return [this.livePosition[0] - this.gcodeOffset[0], this.livePosition[1] - this.gcodeOffset[1]]
    }

    @Watch('sdCardFilePath')
    sdCardFilePathChanged(newVal: string): void {
        if (newVal === '') return

        this.loadFile()
    }

    mounted(): void {
        if (this.sdCardFilePath) this.loadFile()
    }

    beforeDestroy(): void {
        this.cancelTokenSource?.cancel('component destroyed')
        this.worker?.terminate()
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
        this.runs = []

        const cancelTokenSource = axios.CancelToken.source()
        this.cancelTokenSource = cancelTokenSource

        try {
            const response = await axios.get<string>(
                this.apiUrl + '/server/files/' + escapePath('gcodes/' + filename),
                { cancelToken: cancelTokenSource.token, responseType: 'text' }
            )

            if (response.data.length > MAX_FILE_SIZE_BYTES) {
                this.error = this.$t('Panels.GcodePreviewPanel.FileTooLarge').toString()
                this.loading = false
                return
            }

            this.parseInWorker(response.data, filename)
        } catch (e) {
            if (axios.isCancel(e)) return

            this.error = this.$t('Panels.GcodePreviewPanel.LoadError').toString()
            this.loading = false
        }
    }

    private parseInWorker(text: string, filename: string): void {
        const bedSizeMm = Math.max(this.bedMax[0] - this.bedMin[0], this.bedMax[1] - this.bedMin[1])

        const worker = new GcodePreviewWorker()
        this.worker = worker

        worker.onmessage = (event: MessageEvent<GcodePreviewWorkerOutMessage>) => {
            if (event.data.type === 'result') {
                this.runs = event.data.runs
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
</style>
