<template>
    <e-chart
        ref="heightmap"
        :option="chartOptions"
        :init-options="{ renderer: 'canvas' }"
        style="height: 600px; width: 100%; overflow: hidden" />
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import BedmeshMixin from '@/components/mixins/bedmesh'

import { use } from 'echarts/core'

// import ECharts modules manually to reduce bundle size
import { CanvasRenderer } from 'echarts/renderers'
import { VisualMapComponent } from 'echarts/components'

// @ts-ignore
import { Grid3DComponent } from 'echarts-gl/components'
//type definitions for echarts-gl do not exist
// @ts-ignore
import { SurfaceChart } from 'echarts-gl/charts'
import type { ECharts } from 'echarts'
import ThemeMixin from '@/components/mixins/theme'

use([CanvasRenderer, VisualMapComponent, Grid3DComponent, SurfaceChart])

interface HeightmapSerie {
    type: string
    name: string
    data: number[][]
    dataShape?: number[]
    itemStyle?: {
        opacity?: number
        color?: number[]
    }
    wireframe: {
        show: boolean
    }
}

@Component
export default class HeightmapChart extends Mixins(BaseMixin, BedmeshMixin, ThemeMixin) {
    declare $refs: {
        // eslint-disable-next-line
        heightmap: any
    }

    @Prop({ type: Boolean, default: false }) showProbed!: boolean
    @Prop({ type: Boolean, default: false }) showMesh!: boolean
    @Prop({ type: Boolean, default: false }) showFlat!: boolean
    @Prop({ type: Boolean, default: false }) wireframe!: boolean
    @Prop({ type: Boolean, default: false }) scaleGradient!: boolean
    @Prop({ type: Number, default: 1 }) scaleZMax!: number

    get chart(): ECharts | null {
        return this.$refs.heightmap?.chart ?? null
    }

    get chartOptions() {
        return {
            tooltip: {
                backgroundColor: this.bgColor(0.9),
                borderWidth: 0,
                textStyle: {
                    color: this.fgColor(1),
                    fontSize: '14px',
                },
                padding: 15,
                formatter: this.tooltipFormatter,
            },
            darkMode: this.$vuetify.theme.dark,
            animation: false,
            legend: {
                show: false,
                selected: this.selected,
            },
            visualMap: {
                show: true,
                min: this.visualMapRange[0],
                max: this.visualMapRange[1],
                calculable: true,
                dimension: 2,
                inRange: {
                    color: this.colorMap,
                },
                seriesIndex: this.visualMapSeriesIndex,
                left: this.isMobile ? 10 : 30,
                top: 20,
                bottom: 0,
                itemWidth: this.isMobile ? 10 : 30,
                itemHeight: 550,
                precision: 3,
                textStyle: {
                    color: this.fgColorHi,
                    fontSize: 14,
                },
            },
            xAxis3D: {
                type: 'value',
                nameTextStyle: {
                    color: this.fgColorMid,
                },
                min: this.rangeX[0],
                max: this.rangeX[1],
                minInterval: 1,
            },
            yAxis3D: {
                type: 'value',
                nameTextStyle: {
                    color: this.fgColorMid,
                },
                min: this.rangeY[0],
                max: this.rangeY[1],
            },
            zAxis3D: {
                type: 'value',
                min: this.scaleZMax * -1,
                max: this.scaleZMax,
                nameTextStyle: {
                    color: this.fgColorMid,
                },
                axisPointer: {
                    label: {
                        formatter: function (value: any) {
                            value = parseFloat(value)
                            return value.toFixed(2)
                        },
                    },
                },
            },
            grid3D: {
                axisLabel: {
                    textStyle: { color: this.fgColorMid },
                },
                axisLine: {
                    lineStyle: { color: this.fgColorLow },
                },
                axisTick: {
                    lineStyle: { color: this.fgColorLow },
                },
                splitLine: {
                    lineStyle: { color: this.fgColorLow },
                },
                axisPointer: {
                    lineStyle: { color: this.fgColorHi },
                    label: {
                        textStyle: { color: this.fgColorHi },
                    },
                },
                boxWidth: 100 * this.scaleX,
                boxDepth: 100 * this.scaleY,
                viewControl: { distance: 150 },
            },
            series: this.series,
        }
    }

    get selected(): { [key: string]: boolean } {
        return {
            probed: this.showProbed,
            mesh: this.showMesh,
            flat: this.showFlat,
        }
    }

    get series(): HeightmapSerie[] {
        const series = []

        if (this.bed_mesh) {
            series.push(this.seriesProbed)
            series.push(this.seriesMesh)
            series.push(this.seriesFlat)
        }

        return series
    }

    get seriesProbed(): HeightmapSerie {
        const serie: HeightmapSerie = {
            type: 'surface',
            name: 'probed',
            data: [],
            itemStyle: { opacity: 1 },
            wireframe: { show: this.wireframe },
        }

        if (this.bed_mesh) {
            const xCount = this.bed_mesh.probed_matrix[0].length
            const yCount = this.bed_mesh.probed_matrix.length
            const xMin = this.bed_mesh.mesh_min[0]
            const xMax = this.bed_mesh.mesh_max[0]
            const yMin = this.bed_mesh.mesh_min[1]
            const yMax = this.bed_mesh.mesh_max[1]
            const xStep = (xMax - xMin) / (xCount - 1)
            const yStep = (yMax - yMin) / (yCount - 1)

            const data: any[] = []

            let yPoint = 0
            this.bed_mesh.probed_matrix.forEach((meshRow: number[]) => {
                let xPoint = 0
                meshRow.forEach((value: number) => {
                    data.push([xMin + xStep * xPoint, yMin + yStep * yPoint, value])
                    xPoint++
                })
                yPoint++
            })

            serie.data = data
            serie.dataShape = [yCount, xCount]
        }

        return serie
    }

    get seriesMesh(): HeightmapSerie {
        const serie: HeightmapSerie = {
            type: 'surface',
            name: 'mesh',
            data: [],
            itemStyle: { opacity: 1 },
            wireframe: { show: this.wireframe },
        }

        if (this.bed_mesh) {
            const xCount = this.bed_mesh.mesh_matrix[0].length
            const yCount = this.bed_mesh.mesh_matrix.length
            const xMin = this.bed_mesh.mesh_min[0]
            const xMax = this.bed_mesh.mesh_max[0]
            const yMin = this.bed_mesh.mesh_min[1]
            const yMax = this.bed_mesh.mesh_max[1]
            const xStep = (xMax - xMin) / (xCount - 1)
            const yStep = (yMax - yMin) / (yCount - 1)

            const data: any[] = []

            let yPoint = 0
            this.bed_mesh.mesh_matrix.forEach((meshRow: number[]) => {
                let xPoint = 0
                meshRow.forEach((value: number) => {
                    data.push([xMin + xStep * xPoint, yMin + yStep * yPoint, value])
                    xPoint++
                })
                yPoint++
            })

            serie.data = data
            serie.dataShape = [yCount, xCount]
        }

        return serie
    }

    get seriesFlat(): HeightmapSerie {
        const serie: HeightmapSerie = {
            type: 'surface',
            name: 'flat',
            data: [],
            itemStyle: {
                color: [1, 1, 1, 1],
                opacity: 0.5,
            },
            wireframe: { show: this.wireframe },
        }

        const config = this.$store.state.printer.configfile?.settings?.bed_mesh
        if (config) {
            let probe_count = [1, 1]
            if (config.probe_count && typeof config.probe_count === 'string') {
                probe_count = config.probe_count.split(',')
            } else if (config.probe_count) {
                probe_count =
                    config.probe_count.length < 2 ? [config.probe_count, config.probe_count] : config.probe_count
            } else if (config.round_probe_count) {
                probe_count = [config.round_probe_count, config.round_probe_count]
            }

            let mesh_min = config.mesh_min ?? [0, 0]
            let mesh_max = config.mesh_max ?? [200, 200]

            if ('mesh_radius' in config) {
                // delta min/max
                mesh_min = [config.mesh_radius * -1, config.mesh_radius * -1]

                mesh_max = [config.mesh_radius, config.mesh_radius]
            }

            const xCount = probe_count[0]
            const yCount = probe_count[1]
            const xMin = parseFloat(mesh_min[0])
            const xMax = parseFloat(mesh_max[0])
            const yMin = parseFloat(mesh_min[1])
            const yMax = parseFloat(mesh_max[1])
            const xStep = (xMax - xMin) / (xCount - 1)
            const yStep = (yMax - yMin) / (yCount - 1)

            const data: number[][] = []

            for (let y = 0; y < yCount; y++) {
                for (let x = 0; x < xCount; x++) {
                    data.push([xMin + xStep * x, yMin + yStep * y, 0])
                }
            }

            serie.data = data
            serie.dataShape = [yCount, xCount]
        }

        return serie
    }

    get colorMap(): string[] {
        return this.$store.getters['gui/heightmap/getActiveColorSchemeList']
    }

    get visualMapSeriesIndex(): number[] {
        const output = []

        if (this.showProbed) output.push(0)
        else if (this.showMesh) output.push(1)

        return output
    }

    get visualMapRange(): number[] {
        if (!this.scaleGradient) return [-0.1, 0.1]

        return this.heightmapLimit
    }

    get heightmapLimit(): number[] {
        let min = 0
        let max = 0

        if (this.bed_mesh) {
            const points = []
            if (this.showProbed) {
                for (const row of this.bed_mesh.probed_matrix) for (const col of row) points.push(col)
            }
            if (this.showMesh) {
                for (const row of this.bed_mesh.mesh_matrix) for (const col of row) points.push(col)
            }

            min = Math.min(min, ...points)
            max = Math.max(max, ...points)
        }

        return [min, max]
    }

    get rangeX(): number[] {
        const axis_minimum = this.$store.state.printer.toolhead?.axis_minimum
        const axis_maximum = this.$store.state.printer.toolhead?.axis_maximum

        return [axis_minimum[0] ?? 0, axis_maximum[0] ?? 0]
    }

    get rangeY(): number[] {
        const axis_minimum = this.$store.state.printer.toolhead?.axis_minimum ?? [0, 0]
        const axis_maximum = this.$store.state.printer.toolhead?.axis_maximum ?? [0, 0]

        return [axis_minimum[1] ?? 0, axis_maximum[1] ?? 0]
    }

    get absRangeX(): number {
        return this.rangeX[1] - this.rangeX[0]
    }

    get absRangeY(): number {
        return this.rangeY[1] - this.rangeY[0]
    }

    get minRangeXY(): number {
        return Math.min(this.absRangeX, this.absRangeY)
    }

    get scaleX(): number {
        if (this.minRangeXY === 0) return 1

        return this.absRangeX / this.minRangeXY
    }

    get scaleY(): number {
        if (this.minRangeXY === 0) return 1

        return this.absRangeY / this.minRangeXY
    }

    tooltipFormatter(data: any): string {
        const outputArray: string[] = []
        outputArray.push(`<b>${data.seriesName}</b>`)

        Object.keys(data.encode)
            .sort()
            .forEach((axisName: string) => {
                const value = data.data[data.encode[axisName][0]].toFixed(axisName === 'z' ? 3 : 1)

                outputArray.push(`<b>${axisName.toUpperCase()}</b>: ${value} mm`)
            })

        return outputArray.join('<br />')
    }

    beforeDestroy(): void {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }
}
</script>
