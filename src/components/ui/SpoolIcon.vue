<template>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 487.04 487.04"
        xml:space="preserve"
        class="cursor-pointer"
        @click="clickSpool">
        <defs>
            <linearGradient v-if="isMultiColorLongitudinal" :id="gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                    v-for="(stop, i) in gradientStops"
                    :key="`stop-${i}`"
                    :offset="stop.offset"
                    :stop-color="stop.color" />
            </linearGradient>
        </defs>
        <g>
            <template v-if="isMultiColorCoaxial">
                <path
                    v-for="(segment, i) in radialSegments"
                    :key="`coaxial-${i}`"
                    :style="{ fill: segment.color }"
                    :d="segment.d" />
            </template>

            <circle
                v-else-if="isMultiColorLongitudinal"
                :style="{ fill: `url(#${gradientId})` }"
                :cx="cx"
                :cy="cy"
                :r="outerR" />

            <circle v-else :style="styleCircle1" :cx="cx" :cy="cy" :r="outerR" />

            <circle :style="styleCircle2" cx="243.52" cy="243.52" r="112.5" />
            <path
                :style="styleCircle3"
                d="M0,243.52c0,134.42,109.1,243.52,243.52,243.52,134.42,0,243.52-109.1,243.52-243.52S377.95,0,243.52,0C109.1,0,0,109.1,0,243.52Zm115.73,181.78c-52.4-39.5-86.52-98.59-94.52-163.72v-.09c-.68-5.43,1-10.89,4.6-15,3.6-4.12,8.79-6.51,14.26-6.57l118.36-1.33c18.99-.21,36.63,9.83,46.12,26.29,9.5,16.45,9.38,36.74-.3,53.09l-60.29,101.76c-2.8,4.73-7.48,8.03-12.87,9.1-5.39,1.06-10.98-.22-15.36-3.52ZM450.22,238.8c5.49,.06,10.7,2.46,14.31,6.59,3.62,4.13,5.3,9.61,4.63,15.06-8.01,65.13-42.12,124.22-94.52,163.72l-.07,.05c-4.37,3.29-9.93,4.57-15.3,3.51-5.37-1.06-10.03-4.36-12.82-9.06l-60.33-101.84c-9.68-16.34-9.8-36.64-.3-53.09,9.5-16.45,27.13-26.5,46.12-26.29l118.27,1.33ZM338.12,40.02c5.04,2.14,8.92,6.32,10.69,11.49,1.77,5.18,1.24,10.86-1.44,15.63l-58.03,103.17c-9.31,16.56-26.83,26.8-45.83,26.8-19,0-36.51-10.25-45.83-26.8l-57.99-103.09c-2.69-4.79-3.22-10.49-1.45-15.69,1.77-5.2,5.68-9.4,10.73-11.54,60.41-25.63,128.64-25.63,189.05,0l.08,.04Z" />
        </g>
    </svg>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerSpoolmanStateFilament } from '@/store/server/spoolman/types'

interface RadialSegment {
    color: string
    d: string
}

interface GradientStop {
    offset: string
    color: string
}

const SPOOL_CX = 243.52
const SPOOL_CY = 243.52
const SPOOL_OUTER_R = 232.97

@Component({})
export default class SpoolIcon extends Mixins(BaseMixin) {
    @Prop({ required: false, default: '#ff0' })
    declare readonly color: string

    @Prop({ type: String, required: false })
    declare readonly multiColorHexes: string | undefined

    @Prop({ type: String, required: false })
    declare readonly multiColorDirection: ServerSpoolmanStateFilament['multi_color_direction']

    // gradient ids need to be unique document-wide, not just within the scope of the svg
    gradientId = `longitudinalGradient-${Math.random().toString(36).slice(2)}`
    readonly cx = SPOOL_CX
    readonly cy = SPOOL_CY
    readonly outerR = SPOOL_OUTER_R

    get multiColors(): string[] {
        if (!this.multiColorHexes) return []

        return this.multiColorHexes.split(',').map((h) => {
            const trimmed = h.trim()
            return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
        })
    }

    get isMultiColorCoaxial(): boolean {
        return this.multiColors.length > 1 && this.multiColorDirection === 'coaxial'
    }

    get isMultiColorLongitudinal(): boolean {
        // fall back to longitudinal for null/unknown direction values
        return this.multiColors.length > 1 && this.multiColorDirection !== 'coaxial'
    }

    get styleCircle1() {
        return { fill: this.color }
    }

    get styleCircle2() {
        return { fill: '#bebebe' }
    }

    get styleCircle3() {
        return { fill: '#343434' }
    }

    get radialSegments(): RadialSegment[] {
        const colors = this.multiColors
        const count = colors.length
        const anglePerSegment = (2 * Math.PI) / count
        // start with the first border between two colors at 12 o'clock
        const rotate = -Math.PI / 2

        return colors.map((color, i) => {
            const startRad = i * anglePerSegment + rotate
            const endRad = (i + 1) * anglePerSegment + rotate
            const x1 = this.cx + this.outerR * Math.cos(startRad)
            const y1 = this.cy + this.outerR * Math.sin(startRad)
            const x2 = this.cx + this.outerR * Math.cos(endRad)
            const y2 = this.cy + this.outerR * Math.sin(endRad)
            return {
                color,
                d: `M${this.cx},${this.cy} L${x1},${y1} A${this.outerR},${this.outerR} 0 0,1 ${x2},${y2} Z`,
            }
        })
    }

    get gradientStops(): GradientStop[] {
        const colors = this.multiColors
        if (colors.length < 2) return []

        const count = colors.length
        return colors.map((color, i) => ({
            offset: `${(i / (count - 1)) * 100}%`,
            color,
        }))
    }

    clickSpool() {
        this.$emit('click-spool')
    }
}
</script>
