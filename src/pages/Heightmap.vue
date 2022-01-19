<style scoped>
.rename-profile {
    text-transform: none;
}
</style>

<template>
    <div>
        <v-row v-if="klipperReadyForGui">
            <v-col class="col-12 col-md-8 pb-0">
                <panel card-class="heightmap-map-panel" :title="$t('Heightmap.Heightmap')" icon="mdi-grid">
                    <template v-slot:buttons-title>
                        <v-btn text tile color="primary" class="ml-1 d-none d-sm-inline-flex rename-profile" v-if="meshLoaded" @click="openRenameProfile()">{{ bed_mesh.profile_name }}</v-btn>
                    </template>
                    <template v-slot:buttons>
                        <v-btn text tile color="primary" class="d-sm-none" v-if="meshLoaded" @click="openRenameProfile()">{{ bed_mesh ? bed_mesh.profile_name : "" }}</v-btn>
                        <v-btn icon tile class="d-none d-sm-flex" @click="homePrinter" :color="homedAxes.includes('xyz') ? 'primary' : 'warning'" :loading="loadings.includes('homeAll')" :title="$t('Heightmap.TitleHomeAll')" :ripple="true"><v-icon>mdi-home</v-icon></v-btn>
                        <v-btn text tile class="d-none d-sm-flex" @click="clearBedMesh" :loading="loadings.includes('bedMeshClear')" v-if="meshLoaded" :title="$t('Heightmap.TitleClear')">{{ $t('Heightmap.Clear') }}</v-btn>
                        <v-btn text tile class="d-none d-sm-flex" @click="calibrateDialog = true" :loading="loadings.includes('bedMeshCalibrate')" :disabled="printerIsPrinting" :title="$t('Heightmap.TitleCalibrate')">{{ $t('Heightmap.Calibrate') }}</v-btn>
                    </template>
                    <v-card-text class="d-sm-none text-center pb-0">
                        <v-item-group tile class="v-btn-toggle" name="controllers">
                            <v-btn text small class="px-2 minwidth-0" :color="homedAxes.includes('xyz') ? 'primary' : 'warning'" @click="homePrinter" :loading="loadings.includes('homeAll')" :title="$t('Heightmap.TitleHomeAll')"><v-icon :color="homedAxes.includes('xyz') ? 'primary' : 'warning'" small>mdi-home</v-icon></v-btn>
                            <v-btn text small class="px-2 minwidth-0" color="primary" @click="clearBedMesh" :loading="loadings.includes('bedMeshClear')" v-if="bed_mesh" :title="$t('Heightmap.TitleClear')">{{ $t('Heightmap.Clear') }}</v-btn>
                            <v-btn text small class="px-2 minwidth-0" color="primary" @click="calibrateDialog = true" :loading="loadings.includes('bedMeshCalibrate')" :disabled="printerIsPrinting" :title="$t('Heightmap.TitleCalibrate')">{{ $t('Heightmap.Calibrate') }}</v-btn>
                        </v-item-group>
                    </v-card-text>
                    <template v-if="!(meshLoaded)">
                        <v-card-text class="text-center py-3 font-italic">
                            {{ $t('Heightmap.NoBedMeshHasBeenLoadedYet') }}
                        </v-card-text>
                    </template>
                    <template v-else>
                        <v-card-text class="py-0 px-0">
                            <v-row>
                                <v-col class="">
                                    <ECharts
                                        ref="heightmap"
                                        :option="chartOptions"
                                        :init-options="{ renderer: 'svg' }"
                                        style="height: 400px; width: 100%; overflow: hidden;"
                                    ></ECharts>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="col-12 col-sm-auto pt-0 pb-0 pl-sm-6 d-flex justify-center justify-sm-start">
                                    <v-switch v-model="scaleVisualMap" :label="$t('Heightmap.Scale')" class="mt-0 ml-5"></v-switch>
                                </v-col>
                                <v-col class="d-flex justify-center pt-0 pb-6 pb-sm-3 pr-sm-16">
                                    <v-checkbox v-model="showProbed" :label="$t('Heightmap.Probed')" hide-details class="mx-3 mt-0" ></v-checkbox>
                                    <v-checkbox v-model="showMesh" :label="$t('Heightmap.Mesh')" hide-details class="mx-3 mt-0" ></v-checkbox>
                                    <v-checkbox v-model="showFlat" :label="$t('Heightmap.Flat')" hide-details class="mx-3 mt-0" ></v-checkbox>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-text class="pt-0 pb-3">
                            <v-row>
                                <v-col class="col-4">
                                    <v-checkbox v-model="wireframe" :label="$t('Heightmap.Wireframe')" hide-details ></v-checkbox>
                                </v-col>
                                <v-col class="col-8">
                                    <v-slider :label="$t('Heightmap.Scale')" :min="heightmapRangeLimit[0]" :max="heightmapRangeLimit[1]" v-model="heightmapScale" :step="0.1" ticks="always" class="mt-4" hide-details ></v-slider>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </template>
                </panel>
            </v-col>
            <v-col class="col-12 col-md-4">
                <panel :title="$t('Heightmap.CurrentMesh.Headline')" v-if="meshLoaded" card-class="heightmap-current-mesh-panel" icon="mdi-information" :collapsible="true" class="mt-0">
                    <v-card-text class="py-3 px-0">
                        <v-row class="px-3">
                            <v-col>{{ $t('Heightmap.CurrentMesh.Name') }}</v-col>
                            <v-col class="text-right">{{ bed_mesh.profile_name }}</v-col>
                        </v-row>
                        <v-divider class="my-3"></v-divider>
                        <v-row class="px-3">
                            <v-col>{{ $t('Heightmap.CurrentMesh.Size') }}</v-col>
                            <v-col class="text-right">{{ bed_mesh.probed_matrix[0].length }}x{{ bed_mesh.probed_matrix.length }}</v-col>
                        </v-row>
                        <v-divider class="my-3"></v-divider>
                        <v-row class="px-3">
                            <v-col>{{ $t('Heightmap.CurrentMesh.Max') }} [{{ bedMeshMaxPoint.positionX }}, {{ bedMeshMaxPoint.positionY }}]</v-col>
                            <v-col class="text-right">{{ bedMeshMaxPoint.value }} mm</v-col>
                        </v-row>
                        <v-divider class="my-3"></v-divider>
                        <v-row class="px-3">
                            <v-col>{{ $t('Heightmap.CurrentMesh.Min') }} [{{ bedMeshMinPoint.positionX }}, {{ bedMeshMinPoint.positionY }}]</v-col>
                            <v-col class="text-right">{{ bedMeshMinPoint.value }} mm</v-col>
                        </v-row>
                        <v-divider class="my-3"></v-divider>
                        <v-row class="px-3">
                            <v-col>{{ $t('Heightmap.CurrentMesh.Variance') }}</v-col>
                            <v-col class="text-right">{{ Math.abs(bedMeshMinPoint.value - bedMeshMaxPoint.value).toFixed(3) }} mm</v-col>
                        </v-row>
                    </v-card-text>
                </panel>
                <panel :title="$t('Heightmap.Profiles')" card-class="heightmap-profiles-panel" icon="mdi-stack-overflow" :collapsible="true" class="mt-6 mt-md-0">
                    <v-card-text class="py-0 px-0" v-if="profiles.length">
                        <v-simple-table>
                            <template v-slot:default>
                                <tbody>
                                <tr v-for="(profile, index) in profiles" :key="index" >
                                    <td><span @click="loadProfile(profile.name)" :class="profile.is_active ? 'font-weight-bold' : ''" style="cursor: pointer;">{{ profile.name }}</span><small class="ml-2" v-if="'deleted' in profile.data">({{ $t('Heightmap.Deleted') }})</small></td>
                                    <td>
                                        <v-tooltip top color="rgba(0,0,0,0.8)">
                                            <template v-slot:activator="{ on, attrs }">
                                                <small v-bind="attrs" v-on="on">{{ profile.variance.toFixed(3) }}</small>
                                            </template>
                                            <span>max: {{ profile.max }}<br />min: {{ profile.min }}</span>
                                        </v-tooltip>
                                    </td>
                                    <td class="text-right">
                                        <v-btn-toggle dense no-gutters>
                                            <v-btn class="minwidth-0" @click="loadProfile(profile.name)" :loading="loadings.includes('bedMeshLoad_'+profile.name)" :disabled="profile.is_active || 'deleted' in profile.data" ><v-icon small>mdi-view-grid-plus</v-icon></v-btn>
                                            <v-btn class="minwidth-0" @click="openRemoveProfile(profile.name)" :loading="loadings.includes('bedMeshRemove_'+profile.name)" :disabled="'deleted' in profile.data" :title="$t('Heightmap.DeleteBedMeshProfile')" ><v-icon small>mdi-delete</v-icon></v-btn>
                                        </v-btn-toggle>
                                    </td>
                                </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-card-text>
                    <v-card-text v-else>
                        <p>{{ $t('Heightmap.NoProfile') }}</p>
                    </v-card-text>
                </panel>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-alert
                border="left"
                colored-border
                type="warning"
                elevation="2"
                class="mx-auto mt-6"
                max-width="500"
                icon="mdi-lock-outline"
            >{{ $t('Heightmap.ErrorKlipperNotReady') }}</v-alert>
        </v-row>
        <v-dialog v-model="renameDialog" persistent :max-width="400" @keydown.esc="renameDialog = false">
            <panel :title="$t('Heightmap.RenameBedMeshProfile')" icon="mdi-grid" card-class="heightmap-rename-dialog" :margin-bottom="false">
                <v-card-text>
                    <v-text-field
                        :label="$t('Heightmap.Name')" 
                        v-model="newName"
                        ref="inputDialogRenameHeightmapName"
                        @keyup.enter="renameProfile"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="renameDialog = false">{{ $t('Heightmap.Abort') }}</v-btn>
                    <v-btn color="primary" text @click="renameProfile">{{ $t('Heightmap.Rename') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="calibrateDialog" persistent :max-width="400" @keydown.esc="calibrateDialog = false">
            <panel :title="$t('Heightmap.BedMeshCalibrate')" icon="mdi-grid" card-class="heightmap-calibrate-dialog" :margin-bottom="false">
                <v-card-text>
                    <p>{{ $t('Heightmap.DoYouReallyWantToCalibrate') }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="calibrateDialog = false">{{ $t('Heightmap.Abort') }}</v-btn>
                    <v-btn color="primary" text @click="calibrateMesh">{{ $t('Heightmap.Calibrate') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="removeDialog" persistent :max-width="400" @keydown.esc="removeDialog = false">
            <panel :title="$t('Heightmap.BedMeshRemove')" icon="mdi-grid" card-class="heightmap-calibrate-dialog" :margin-bottom="false">
                <v-card-text>
                    <p>{{ $t('Heightmap.DoYouReallyWantToDelete', { name: removeDialogProfile })  }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="removeDialog = false">{{ $t('Heightmap.Abort') }}</v-btn>
                    <v-btn color="error" text @click="removeProfile">{{ $t('Heightmap.Remove') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>
<script lang="ts">
import {Component, Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'

import { createComponent } from 'echarts-for-vue'
import * as echarts from 'echarts'
import {ECharts} from 'echarts/core'
import 'echarts-gl'
import Panel from '@/components/ui/Panel.vue'

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

@Component({
    components: {
        Panel,
        ECharts: createComponent({ echarts }),
    }
})
export default class PageHeightmap extends Mixins(BaseMixin, ControlMixin) {

    $refs!: {
        // eslint-disable-next-line
        heightmap: any,
        inputDialogRenameHeightmapName: HTMLInputElement,
    }

    private renameDialog = false
    private removeDialogProfile = ''
    private removeDialog = false
    private calibrateDialog = false
    private newName = ''
    private oldName = ''

    private heightmapScale = 0.5
    private probedOpacity = 1
    private meshOpacity = 1
    private flatOpacity = 0.5

    private colorAxisName = 'rgba(255,255,255,0.5)'
    private colorAxisLabel = 'rgba(255,255,255,0.5)'
    private colorAxisLine = 'rgba(255,255,255,0.2)'
    private colorAxisTick = 'rgba(255,255,255,0.2)'
    private colorSplitLine = 'rgba(255,255,255,0.2)'

    private colorAxisPointer = 'rgba(255,255,255,0.8)'

    private colorVisualMap = 'rgba(255,255,255,0.8)'
    private fontSizeVisualMap = 14

    get chartOptions() {
        return {
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.9)',
                borderWidth: 0,
                textStyle: {
                    color: '#fff',
                    fontSize: '14px'
                },
                padding: 15,
                formatter: this.tooltipFormatter
            },
            darkMode: true,
            animation: false,
            legend: {
                show: false,
                selected: this.selected
            },
            visualMap: {
                show: true,
                min: this.visualMapRange[0],
                max: this.visualMapRange[1],
                calculable: true,
                dimension: 2,
                inRange: {
                    color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                },
                seriesIndex: this.visualMapSeriesIndex,
                left: this.isMobile ? 10 : 30,
                top: 20,
                bottom: 0,
                itemWidth: this.isMobile ? 10 : 30,
                itemHeight: 350,
                precision: 3,
                textStyle: {
                    color: this.colorVisualMap,
                    fontSize: this.fontSizeVisualMap
                },
            },
            xAxis3D: {
                type: 'value',
                nameTextStyle: {
                    color: this.colorAxisName
                },
                min: this.rangeX[0],
                max: this.rangeX[1],
                minInterval: 1
            },
            yAxis3D: {
                type: 'value',
                nameTextStyle: {
                    color: this.colorAxisName
                },
                min: this.rangeY[0],
                max: this.rangeY[1],
            },
            zAxis3D: {
                type: 'value',
                min: this.heightmapScale * -1,
                max: this.heightmapScale,
                nameTextStyle: {
                    color: this.colorAxisName
                },
                axisPointer: {
                    label: {
                        formatter: function(value: any) {
                            value = parseFloat(value)
                            return value.toFixed(2)
                        }
                    }
                }

            },
            grid3D: {
                axisLabel: {
                    textStyle: {
                        color: this.colorAxisLabel
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: this.colorAxisLine
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: this.colorAxisTick
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: this.colorSplitLine
                    }
                },
                axisPointer: {
                    lineStyle: {
                        color: this.colorAxisPointer
                    },
                    label: {
                        textStyle: {
                            color: this.colorAxisPointer
                        }
                    }
                }
            },
            series: this.series
        }
    }

    get chart (): ECharts | null {
        const heightmap = this.$refs.heightmap
        return heightmap?.inst ?? null
    }

    get profiles () {
        return this.$store.getters['printer/getBedMeshProfiles']
    }

    get bed_mesh() {
        return this.$store.state.printer.bed_mesh ?? null
    }

    @Watch('bed_mesh', { deep: true })
    bed_meshChanged() {
        this.chart?.setOption(this.chartOptions)
    }

    get showProbed(): boolean {
        return this.$store.state.gui.view.heightmap.probed ?? true
    }

    set showProbed(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.probed', value: newVal })
    }

    get showMesh(): boolean {
        return this.$store.state.gui.view.heightmap.mesh ?? true
    }

    set showMesh(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.mesh', value: newVal })
    }

    get showFlat(): boolean {
        return this.$store.state.gui.view.heightmap.flat ?? true
    }

    set showFlat(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.flat', value: newVal })
    }

    get wireframe(): boolean {
        return this.$store.state.gui.view.heightmap.wireframe ?? true
    }

    set wireframe(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.wireframe', value: newVal })
    }

    get scale(): boolean {
        return this.$store.state.gui.view.heightmap.scale ?? true
    }

    set scale(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.scale', value: newVal })
    }

    get scaleVisualMap(): boolean {
        return this.$store.state.gui.view.heightmap.scaleVisualMap ?? false
    }

    set scaleVisualMap(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.scaleVisualMap', value: newVal })
    }

    get rangeX(): number[] {
        const axis_minimum = this.$store.state.printer.toolhead?.axis_minimum
        const axis_maximum = this.$store.state.printer.toolhead?.axis_maximum

        return [axis_minimum[0] ?? 0, axis_maximum[0] ?? 0]
    }

    get rangeY(): number[] {
        const axis_minimum = this.$store.state.printer.toolhead?.axis_minimum ?? [0,0]
        const axis_maximum = this.$store.state.printer.toolhead?.axis_maximum ?? [0,0]

        return [axis_minimum[1] ?? 0, axis_maximum[1] ?? 0]
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

    get probedHeightmapLimit(): number[] {
        let min = 0
        let max = 0

        if (this.bed_mesh) {
            const points = []
            for (const row of this.bed_mesh.probed_matrix) for (const col of row) points.push(col)

            min = Math.min(min, ...points)
            max = Math.max(max, ...points)
        }

        return [min, max]
    }

    get heightmapRangeLimit(): number[] {
        const [min, max] = this.heightmapLimit

        const minRange = Math.round(Math.max(Math.abs(min), Math.abs(max)) * 10) / 10
        const maxRange = Math.max(minRange, 0.5)

        return [minRange, maxRange]
    }

    get selected(): { [key: string]: boolean } {
        return {
            'probed': this.showProbed,
            'mesh': this.showMesh,
            'flat': this.showFlat,
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
            itemStyle: {
                opacity: this.probedOpacity
            },
            wireframe: {
                show: this.wireframe
            }
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
                    data.push([
                        (xMin + xStep * xPoint),
                        (yMin + yStep * yPoint),
                        value
                    ])
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
            itemStyle: {
                opacity: this.meshOpacity
            },
            wireframe: {
                show: this.wireframe,
            }
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
                    data.push([
                        (xMin + xStep * xPoint),
                        (yMin + yStep * yPoint),
                        value
                    ])
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
                opacity: this.flatOpacity
            },
            wireframe: {
                show: this.wireframe
            }
        }

        const config = this.$store.state.printer.configfile?.settings?.bed_mesh
        if (config) {
            let probe_count = [1,1]
            if (config.probe_count && typeof config.probe_count === 'string') {
                probe_count = config.probe_count.split(',')
            } else if (config.probe_count) {
                probe_count = config.probe_count
            } else if (config.round_probe_count) {
                probe_count = [config.round_probe_count, config.round_probe_count]
            }

            let mesh_min = []
            let mesh_max = []

            if (config.mesh_min && config.mesh_max) {
                // is no delta
                mesh_min = (typeof config.mesh_min === 'string') ? config.mesh_min.split(',') : config.mesh_min
                mesh_max = (typeof config.mesh_max === 'string') ? config.mesh_max.split(',') : config.mesh_max
            } else {
                // delta min/max
                mesh_min = [
                    config.mesh_radius * -1,
                    config.mesh_radius * -1
                ]

                mesh_max = [
                    config.mesh_radius,
                    config.mesh_radius
                ]
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
                    data.push([
                        xMin + xStep * x,
                        yMin + yStep * y,
                        0
                    ])
                }
            }

            serie.data = data
            serie.dataShape = [yCount, xCount]
        }

        return serie
    }

    get visualMapRange(): number[] {
        if (!this.scaleVisualMap) return [-0.1, 0.1]

        return this.heightmapLimit
    }

    get visualMapSeriesIndex(): number[] {
        const output = []

        if (this.showProbed) output.push(0)
        else if (this.showMesh) output.push(1)

        return output
    }

    get bedMeshMaxPoint() {
        if (this.bed_mesh.profile_name === '') return { row: 0, col: 0, positionX: 0, positionY: 0, value: 0 }

        const [ , max] = this.probedHeightmapLimit

        let row = 0
        let col = 0
        this.bed_mesh.probed_matrix.forEach((rowPoints: number[], index: number) => {
            if (Math.max(...rowPoints) === max) {
                row = index + 1
                col = rowPoints.findIndex((point: number) => point === max) + 1
            }
        })

        const positionX = Math.round((this.bed_mesh.mesh_min[0] + (this.bed_mesh.mesh_max[0] - this.bed_mesh.mesh_min[0]) / this.bed_mesh.probed_matrix[0].length * (col - 1)) * 10) / 10
        const positionY = Math.round((this.bed_mesh.mesh_min[1] + (this.bed_mesh.mesh_max[1] - this.bed_mesh.mesh_min[1]) / this.bed_mesh.probed_matrix.length * (row - 1)) * 10) / 10

        return {
            row,
            col,
            positionX,
            positionY,
            value: Math.round(max * 1000) / 1000
        }
    }

    get bedMeshMinPoint() {
        if (this.bed_mesh.profile_name === '') return { row: 0, col: 0, positionX: 0, positionY: 0, value: 0 }

        const [min, ] = this.probedHeightmapLimit

        let row = 0
        let col = 0
        this.bed_mesh.probed_matrix.forEach((rowPoints: number[], index: number) => {
            if (Math.min(...rowPoints) === min) {
                row = index + 1
                col = rowPoints.findIndex((point: number) => point === min) + 1
            }
        })

        const positionX = Math.round((this.bed_mesh.mesh_min[0] + (this.bed_mesh.mesh_max[0] - this.bed_mesh.mesh_min[0]) / this.bed_mesh.probed_matrix[0].length * (col - 1)) * 10) / 10
        const positionY = Math.round((this.bed_mesh.mesh_min[1] + (this.bed_mesh.mesh_max[1] - this.bed_mesh.mesh_min[1]) / this.bed_mesh.probed_matrix.length * (row - 1)) * 10) / 10

        return {
            row,
            col,
            positionX,
            positionY,
            value: Math.round(min * 1000) / 1000
        }
    }

    get meshLoaded() {
        if(this.bed_mesh !== null) {
            return this.bed_mesh.profile_name !== ''
        } else {
            return false
        }
    }

    tooltipFormatter(data: any): string {
        const outputArray: string[] = []
        outputArray.push('<b>'+data.seriesName+'</b>')

        Object.keys(data.encode).sort().forEach((axisName: string) => {
            outputArray.push('<b>' + axisName.toUpperCase() + '</b>: '+data.data[data.encode[axisName][0]].toFixed(axisName === 'z' ? 3 : 1) + ' mm')
        })

        return outputArray.join('<br />')
    }

    loadProfile(name: string): void {
        this.$store.dispatch('server/addEvent', { message: 'BED_MESH_PROFILE LOAD='+name, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'BED_MESH_PROFILE LOAD='+name }, { loading: 'bedMeshLoad_'+name })
    }

    openRenameProfile(): void {
        this.newName = this.bed_mesh?.profile_name ?? ''
        this.oldName = this.bed_mesh.profile_name
        this.renameDialog = true

        setTimeout(() => {
            this.$refs.inputDialogRenameHeightmapName?.focus()
        }, 200)
    }

    renameProfile(): void {
        this.renameDialog = false

        this.$store.dispatch('server/addEvent', { message: 'BED_MESH_PROFILE SAVE='+this.newName, type: 'command' })
        this.$store.dispatch('server/addEvent', { message: 'BED_MESH_PROFILE REMOVE='+this.oldName, type: 'command' })

        this.$socket.emit('printer.gcode.script', { script: 'BED_MESH_PROFILE SAVE='+this.newName }, { loading: 'bedMeshRename' })
        this.$socket.emit('printer.gcode.script', { script: 'BED_MESH_PROFILE REMOVE='+this.oldName }, { loading: 'bedMeshRename' })

        this.newName = ''
        this.oldName = ''
    }

    openRemoveProfile(name: string): void {
        this.removeDialogProfile = name
        this.removeDialog = true
    }

    removeProfile(): void {
        this.removeDialog = false
        this.$store.dispatch('server/addEvent', { message: 'BED_MESH_PROFILE REMOVE='+this.removeDialogProfile, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'BED_MESH_PROFILE REMOVE='+this.removeDialogProfile }, {
            action: 'printer/removeBedMeshProfile',
            actionPayload: {name: this.removeDialogProfile},
            loading: 'bedMeshRename_'+this.removeDialogProfile
        })
        this.removeDialogProfile = ''
    }

    homePrinter(): void {
        this.$store.dispatch('server/addEvent', { message: 'G28', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28' }, { loading: 'homeAll' })
    }

    clearBedMesh(): void {
        this.$store.dispatch('server/addEvent', { message: 'BED_MESH_CLEAR', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'BED_MESH_CLEAR' }, { loading: 'bedMeshClear' })
    }

    calibrateMesh(): void {
        this.calibrateDialog = false
        this.$store.dispatch('server/addEvent', { message: 'BED_MESH_CALIBRATE', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'BED_MESH_CALIBRATE' }, { loading: 'bedMeshCalibrate' })
    }

    beforeDestroy(): void {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }
}
</script>