<template>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        :viewBox="viewBox"
        preserveAspectRatio="xMidYMid meet"
        class="gcode-preview-svg">
        <rect
            :x="bedMin[0]"
            :y="convertY(bedMax[1])"
            :width="bedWidth"
            :height="bedHeight"
            fill="none"
            :stroke="fgColorLow"
            stroke-width="1"
            vector-effect="non-scaling-stroke" />
        <path
            :d="remainingPath"
            fill="none"
            :stroke="fgColorFaint"
            stroke-width="1"
            vector-effect="non-scaling-stroke" />
        <path :d="donePath" fill="none" :stroke="primaryColor" stroke-width="1.5" vector-effect="non-scaling-stroke" />
        <circle
            v-if="toolPosition"
            class="gcode-preview-tool"
            :cx="toolPosition[0]"
            :cy="convertY(toolPosition[1])"
            r="3"
            :fill="primaryColor"
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

@Component
export default class GcodePreviewChart extends Mixins(BaseMixin, ThemeMixin) {
    @Prop({ type: Array, required: true }) declare readonly runs: GcodePreviewRun[]
    @Prop({ type: Number, required: true }) declare readonly progressOffset: number
    @Prop({ type: Array, required: false, default: null }) declare readonly toolPosition: [number, number] | null
    @Prop({ type: Array, required: true }) declare readonly bedMin: number[]
    @Prop({ type: Array, required: true }) declare readonly bedMax: number[]

    throttledProgressOffset = 0

    private setThrottledProgressOffset = throttle((value: number) => {
        this.throttledProgressOffset = value
    }, PROGRESS_THROTTLE_MS)

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

    get donePath(): string {
        return this.splitRuns.done.map((run) => this.runToSubpath(run)).join(' ')
    }

    get remainingPath(): string {
        return this.splitRuns.remaining.map((run) => this.runToSubpath(run)).join(' ')
    }

    get splitRuns(): { done: GcodePreviewRun[]; remaining: GcodePreviewRun[] } {
        const done: GcodePreviewRun[] = []
        const remaining: GcodePreviewRun[] = []

        for (const run of this.runs) {
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

    beforeDestroy(): void {
        this.setThrottledProgressOffset.cancel()
    }

    convertY(y: number): number {
        return y * -1
    }

    runToSubpath(run: GcodePreviewRun): string {
        if (run.length === 0) return ''

        return 'M ' + run.map((point) => `${point.x} ${this.convertY(point.y)}`).join(' L ')
    }
}
</script>

<style scoped>
.gcode-preview-svg {
    width: 100%;
    height: 260px;
}

.gcode-preview-tool {
    animation: gcode-preview-pulse 1.2s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center;
}

@keyframes gcode-preview-pulse {
    0% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(1.8);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
