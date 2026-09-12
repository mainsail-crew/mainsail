<template>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        :viewBox="viewBox"
        preserveAspectRatio="xMidYMid meet"
        class="gcode-preview-svg"
        :style="{ aspectRatio: `${bedWidth} / ${bedHeight}` }">
        <rect
            :x="bedMin[0]"
            :y="convertY(bedMax[1])"
            :width="bedWidth"
            :height="bedHeight"
            fill="none"
            :stroke="fgColorLow"
            stroke-width="1"
            vector-effect="non-scaling-stroke" />
        <line
            v-for="x in xGridLines"
            :key="'x' + x"
            :x1="x"
            :x2="x"
            :y1="convertY(bedMin[1])"
            :y2="convertY(bedMax[1])"
            :stroke="fgColorFaint"
            stroke-width="1"
            vector-effect="non-scaling-stroke" />
        <line
            v-for="y in yGridLines"
            :key="'y' + y"
            :x1="bedMin[0]"
            :x2="bedMax[0]"
            :y1="convertY(y)"
            :y2="convertY(y)"
            :stroke="fgColorFaint"
            stroke-width="1"
            vector-effect="non-scaling-stroke" />
        <line
            v-if="hasXAxis"
            :x1="0"
            :x2="0"
            :y1="convertY(bedMin[1])"
            :y2="convertY(bedMax[1])"
            stroke="#e53935"
            stroke-width="1"
            vector-effect="non-scaling-stroke" />
        <line
            v-if="hasYAxis"
            :x1="bedMin[0]"
            :x2="bedMax[0]"
            :y1="convertY(0)"
            :y2="convertY(0)"
            stroke="#43a047"
            stroke-width="1"
            vector-effect="non-scaling-stroke" />
        <path
            :d="travelPath"
            fill="none"
            stroke="#ffd600"
            stroke-width="1"
            stroke-dasharray="2,2"
            vector-effect="non-scaling-stroke" />
        <path
            v-if="showRemaining"
            :d="remainingPath"
            fill="none"
            stroke="#9e9e9e"
            stroke-width="1"
            vector-effect="non-scaling-stroke" />
        <path :d="donePath" fill="none" :stroke="primaryColor" stroke-width="1.5" vector-effect="non-scaling-stroke" />
        <circle
            v-if="toolPosition"
            class="gcode-preview-tool"
            :cx="toolPosition[0]"
            :cy="convertY(toolPosition[1])"
            r="1.8"
            fill="#ff9100"
            vector-effect="non-scaling-stroke" />
    </svg>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ThemeMixin from '@/components/mixins/theme'
import throttle from 'lodash.throttle'
import { defaultPrimaryColor } from '@/store/variables'
import { GcodePreviewRun } from '@/components/panels/GcodePreview/parser'

const PROGRESS_THROTTLE_MS = 500
const GRID_SPACING_MM = 25

@Component
export default class GcodePreviewChart extends Mixins(BaseMixin, ThemeMixin) {
    @Prop({ type: Array, required: true }) declare readonly runs: GcodePreviewRun[]
    @Prop({ type: Array, required: false, default: () => [] }) declare readonly travels: GcodePreviewRun[]
    @Prop({ type: Boolean, required: false, default: true }) declare readonly showRemaining: boolean
    @Prop({ type: Number, required: true }) declare readonly progressOffset: number
    @Prop({ type: Array, required: false, default: null }) declare readonly toolPosition: [number, number] | null
    @Prop({ type: Array, required: true }) declare readonly bedMin: number[]
    @Prop({ type: Array, required: true }) declare readonly bedMax: number[]

    throttledProgressOffset = 0

    // built in created(), not as a class-field initializer - a class field's arrow function
    // captures `this` before vue-class-component finishes wiring up the reactive instance, so
    // assignments from inside it silently miss reactivity.
    private setThrottledProgressOffset: ((value: number) => void) & { cancel(): void } = throttle(() => {}, 0)

    get primaryColor() {
        return this.$store.state.gui.theme?.primary ?? defaultPrimaryColor
    }

    get bedWidth() {
        return this.bedMax[0] - this.bedMin[0]
    }

    get bedHeight() {
        return this.bedMax[1] - this.bedMin[1]
    }

    get viewBox() {
        return `${this.bedMin[0]} ${this.convertY(this.bedMax[1])} ${this.bedWidth} ${this.bedHeight}`
    }

    get xGridLines(): number[] {
        return this.gridLines(this.bedMin[0], this.bedMax[0]).filter((value) => value !== 0)
    }

    get yGridLines(): number[] {
        return this.gridLines(this.bedMin[1], this.bedMax[1]).filter((value) => value !== 0)
    }

    get hasXAxis(): boolean {
        return this.bedMin[0] <= 0 && this.bedMax[0] >= 0
    }

    get hasYAxis(): boolean {
        return this.bedMin[1] <= 0 && this.bedMax[1] >= 0
    }

    get donePath(): string {
        return this.splitRuns.done.map((run) => this.runToSubpath(run)).join(' ')
    }

    get remainingPath(): string {
        return this.splitRuns.remaining.map((run) => this.runToSubpath(run)).join(' ')
    }

    // only the portion already traveled is shown - the dashed line should trail the
    // toolhead marker, not reveal moves that haven't happened yet
    get travelPath(): string {
        return this.splitByProgress(this.travels)
            .done.map((run) => this.runToSubpath(run))
            .join(' ')
    }

    get splitRuns(): { done: GcodePreviewRun[]; remaining: GcodePreviewRun[] } {
        return this.splitByProgress(this.runs)
    }

    splitByProgress(runs: GcodePreviewRun[]): { done: GcodePreviewRun[]; remaining: GcodePreviewRun[] } {
        const done: GcodePreviewRun[] = []
        const remaining: GcodePreviewRun[] = []

        for (const run of runs) {
            const splitIndex = run.findIndex((point) => point.offset > this.throttledProgressOffset)

            if (splitIndex === -1) {
                done.push(run)
                continue
            }

            if (splitIndex === 0) {
                remaining.push(run)
                continue
            }

            done.push(run.slice(0, splitIndex + 1))
            remaining.push(run.slice(splitIndex - 1))
        }

        return { done, remaining }
    }

    @Watch('progressOffset', { immediate: true })
    progressOffsetChanged(newVal: number): void {
        this.setThrottledProgressOffset(newVal)
    }

    created(): void {
        this.setThrottledProgressOffset = throttle((value: number) => {
            this.throttledProgressOffset = value
        }, PROGRESS_THROTTLE_MS)
        // the immediate watcher above already fired, into the placeholder - take the
        // current value now, or a progress that never changes again (an idle or finished
        // print) would leave the whole path drawn as not-yet-printed
        this.throttledProgressOffset = this.progressOffset
    }

    beforeDestroy(): void {
        this.setThrottledProgressOffset.cancel()
    }

    convertY(y: number): number {
        return y * -1
    }

    gridLines(min: number, max: number): number[] {
        const lines: number[] = []
        const start = Math.ceil(min / GRID_SPACING_MM) * GRID_SPACING_MM

        for (let value = start; value < max; value += GRID_SPACING_MM) {
            lines.push(value)
        }

        return lines
    }

    runToSubpath(run: GcodePreviewRun): string {
        if (run.length === 0) return ''

        return 'M ' + run.map((point) => `${point.x} ${this.convertY(point.y)}`).join(' L ')
    }
}
</script>

<style scoped>
.gcode-preview-svg {
    display: block;
    width: 100%;
    height: auto;
    /* a percentage max-height only resolves against a definite parent height - on the
       dedicated page (GcodePreviewPanel.vue's flex chart-wrap) that caps it to the
       viewport; on the dashboard, where the wrap's height is just auto, it's a no-op */
    max-width: 100%;
    max-height: 100%;
    margin: 0 auto;
}
</style>
