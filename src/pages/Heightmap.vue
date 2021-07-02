<style scoped>

</style>

<template>
    <div>
        <v-row>
            <v-col class="col-12 col-md-8">
                <v-card>
                    <v-toolbar flat dense>
                        <v-toolbar-title>
                            <span class="subheading">
                                <v-icon left>mdi-grid</v-icon>
                                {{ $t('Heightmap.Heightmap') }}
                            </span>
                            <v-btn
                                text
                                color="primary"
                                class="ml-1 d-none d-sm-inline-flex"
                                v-if="bed_mesh"
                                @click="openRenameProfile()">{{ bed_mesh ? bed_mesh.profile_name : "" }}</v-btn>
                        </v-toolbar-title>
                        <v-spacer class=""></v-spacer>
                        <v-btn
                            text
                            color="primary"
                            class=" d-sm-none"
                            @click="openRenameProfile()">{{ bed_mesh ? bed_mesh.profile_name : "" }}</v-btn>
                        <v-item-group class="v-btn-toggle d-none d-sm-flex" name="controllers">
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="homePrinter" :loading="loadings.includes('homeAll')" :title="$t('Heightmap.TitleHomeAll')"><v-icon small>mdi-home</v-icon></v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="clearBedMesh" :loading="loadings.includes('bedMeshClear')" v-if="bed_mesh" :title="$t('Heightmap.TitleClear')">{{ $t('Heightmap.Clear') }}</v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="calibrateDialog = true" :loading="loadings.includes('bedMeshCalibrate')" :disabled="printerIsPrinting" :title="$t('Heightmap.TitleCalibrate')">{{ $t('Heightmap.Calibrate') }}</v-btn>
                        </v-item-group>
                    </v-toolbar>
                    <v-card-text class="d-sm-none text-center pb-0">
                        <v-item-group class="v-btn-toggle" name="controllers">
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="homePrinter" :loading="loadings.includes('homeAll')" :title="$t('Heightmap.TitleHomeAll')"><v-icon small>mdi-home</v-icon></v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="clearBedMesh" :loading="loadings.includes('bedMeshClear')" v-if="bed_mesh" :title="$t('Heightmap.TitleClear')">{{ $t('Heightmap.Clear') }}</v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="calibrateDialog = true" :loading="loadings.includes('bedMeshCalibrate')" :disabled="printerIsPrinting" :title="$t('Heightmap.TitleCalibrate')">{{ $t('Heightmap.Calibrate') }}</v-btn>
                        </v-item-group>
                    </v-card-text>
                    <template v-if="!(bed_mesh)">
                        <v-card-text>
                            {{ $t('Heightmap.NoBedMeshHasBeenLoadedYet') }}
                        </v-card-text>
                    </template>
                    <template v-else>
                        <v-card-text class="py-0">
                            <v-row>
                                <v-col class="">
                                    <ECharts
                                        ref="heightmap"
                                        :option="chartOptions"
                                        :init-options="{ renderer: 'svg' }"
                                        style="height: 400px; width: 100%; overflow: auto;"
                                    ></ECharts>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class=" pt-0 pb-3 col-auto">
                                    <v-switch v-model="scaleVisualMap" :label="$t('Heightmap.Scale')" class="mt-0 ml-5"></v-switch>
                                </v-col>
                                <v-col class="d-flex justify-center pt-0 pb-3 pr-16">
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
                </v-card>
            </v-col>
            <v-col class="col-12 col-md-4">
                <v-card>
                    <v-toolbar flat dense>
                        <v-toolbar-title>
                            <span class="subheading"><v-icon left>mdi-stack-overflow</v-icon>{{ $t('Heightmap.Profiles') }}</span>
                        </v-toolbar-title>
                    </v-toolbar>
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
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="renameDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ $t('Heightmap.RenameBedMeshProfile') }}</span>
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field :label="$t('Heightmap.Name')" required v-model="newName"></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="waring darken-1" text @click="renameDialog = false">{{ $t('Heightmap.Abort') }}</v-btn>
                    <v-btn color="blue darken-1" text @click="renameProfile">{{ $t('Heightmap.Rename') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="calibrateDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ $t('Heightmap.BedMeshCalibrate') }}</span>
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <p>{{ $t('Heightmap.DoYouReallyWantToCalibrate') }}</p>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="warning darken-1" text @click="calibrateDialog = false">{{ $t('Heightmap.Abort') }}</v-btn>
                    <v-btn color="blue darken-1" text @click="calibrateMesh">{{ $t('Heightmap.Calibrate') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="removeDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline"></span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <p>{{ $t('Heightmap.DoYouReallyWantToDelete') }} "{{ removeDialogProfile }}"?</p>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="waring darken-1" text @click="removeDialog = false">{{ $t('Heightmap.Abort') }}</v-btn>
                    <v-btn color="blue darken-1" text @click="removeProfile">{{ $t('Heightmap.Remove') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script lang="ts">
import {Component, Mixins, Watch} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";

import { createComponent } from 'echarts-for-vue';
import * as echarts from 'echarts';
import {ECharts} from "echarts/core";
import 'echarts-gl';

interface heightmapSerie {
    type: string
    name: string
    data: any[]
    itemStyle?: any
    wireframe: {
        show: boolean
    }
}

@Component({
    components: {
        ECharts: createComponent({ echarts }),
    }
})
export default class PageHeightmap extends Mixins(BaseMixin) {

    $refs!: {
        heightmap: any
    }

    private renameDialog = false
    private removeDialogProfile = ''
    private removeDialog = false
    private calibrateDialog = false
    private newName = ''

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
                left: 20,
                top: 20,
                bottom: 0,
                itemWidth: 30,
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
        return this.$store.getters["printer/getBedMeshProfiles"]
    }

    get bed_mesh(): any {
        return this.$store.state.printer.bed_mesh ?? null
    }

    @Watch('bed_mesh', { deep: true })
    bed_meshChanged() {
        this.chart?.setOption(this.chartOptions)
    }

    get showProbed() {
        return this.$store.state.gui.heightmap.probed ?? true
    }

    set showProbed(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'heightmap.probed', value: newVal })
    }

    get showMesh() {
        return this.$store.state.gui.heightmap.mesh ?? true
    }

    set showMesh(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'heightmap.mesh', value: newVal })
    }

    get showFlat() {
        return this.$store.state.gui.heightmap.flat ?? true
    }

    set showFlat(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'heightmap.flat', value: newVal })
    }

    get wireframe() {
        return this.$store.state.gui.heightmap.wireframe ?? true
    }

    set wireframe(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'heightmap.wireframe', value: newVal })
    }

    get scale() {
        return this.$store.state.gui.heightmap.scale ?? true
    }

    set scale(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'heightmap.scale', value: newVal })
    }

    get scaleVisualMap() {
        return this.$store.state.gui.heightmap.scaleVisualMap ?? false
    }

    set scaleVisualMap(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'heightmap.scaleVisualMap', value: newVal })
    }

    get rangeX() {
        const stepper_x = this.$store.state.printer.configfile?.settings?.stepper_x
        if (stepper_x) return [stepper_x.position_min, stepper_x.position_max]

        return [0,0]
    }

    get rangeY() {
        const stepper_y = this.$store.state.printer.configfile?.settings?.stepper_y
        if (stepper_y) return [stepper_y.position_min, stepper_y.position_max]

        return [0,0]
    }

    get heightmapLimit() {
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

    get heightmapRangeLimit() {
        const [min, max] = this.heightmapLimit

        const minRange = Math.round(Math.max(Math.abs(min), Math.abs(max)) * 10) / 10
        const maxRange = Math.max(minRange, 0.5)

        return [minRange, maxRange]
    }

    get selected() {
        return {
            'probed': this.showProbed,
            'mesh': this.showMesh,
            'flat': this.showFlat,
        }
    }

    get series() {
        const series = []

        if (this.bed_mesh) {
            series.push(this.seriesProbed)
            series.push(this.seriesMesh)
            series.push(this.seriesFlat)
        }

        return series
    }

    get seriesProbed() {
        const serie: heightmapSerie = {
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
        }

        return serie
    }

    get seriesMesh() {
        const serie: heightmapSerie = {
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
        }

        return serie
    }

    get seriesFlat() {
        const serie: heightmapSerie = {
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
            const xCount = parseFloat(config.probe_count.split(',')[0])
            const yCount = parseFloat(config.probe_count.split(',')[1])
            const xMin = parseFloat(config.mesh_min.split(',')[0])
            const xMax = parseFloat(config.mesh_max.split(',')[0])
            const yMin = parseFloat(config.mesh_min.split(',')[1])
            const yMax = parseFloat(config.mesh_max.split(',')[1])
            const xStep = (xMax - xMin) / (xCount - 1)
            const yStep = (yMax - yMin) / (yCount - 1)

            const data: any[] = []

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
        }

        return serie
    }

    get visualMapRange() {
        if (!this.scaleVisualMap) return [-0.1, 0.1]

        return this.heightmapLimit
    }

    get visualMapSeriesIndex() {
        const output = []

        if (this.showProbed) output.push(0)
        else if (this.showMesh) output.push(1)

        return output
    }

    tooltipFormatter(data: any) {
        return "<b>"+data.seriesName+"</b><br />" +
            "<b>" + data.dimensionNames[0]+"</b>: "+data.data[0].toFixed(1) + " mm <br />" +
            "<b>" + data.dimensionNames[1]+"</b>: "+data.data[1].toFixed(1) + " mm <br />" +
            "<b>" + data.dimensionNames[2]+"</b>: "+data.data[2].toFixed(3) + " mm "
    }

    loadProfile(name: string) {
        this.$store.dispatch('server/addEvent', { message: "BED_MESH_PROFILE LOAD="+name, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "BED_MESH_PROFILE LOAD="+name }, { loading: 'bedMeshLoad_'+name })
    }

    openRenameProfile() {
        this.newName = this.bed_mesh?.profile_name ?? ""
        this.renameDialog = true
    }

    renameProfile() {
        this.renameDialog = false
        this.$store.dispatch('server/addEvent', { message: "BED_MESH_PROFILE SAVE="+this.newName.toUpperCase(), type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "BED_MESH_PROFILE SAVE="+this.newName.toUpperCase() }, { loading: 'bedMeshRename' })
    }

    openRemoveProfile(name: string) {
        this.newName = name
        this.removeDialog = true;
    }

    removeProfile() {
        this.removeDialog = false;
        this.$store.dispatch('server/addEvent', { message: "BED_MESH_PROFILE REMOVE="+this.newName, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "BED_MESH_PROFILE REMOVE="+this.newName }, {
            action: "printer/removeBedMeshProfile",
            actionPayload: {name: this.newName},
            loading: "bedMeshRename_"+this.newName
        })
        this.removeDialogProfile = ""
    }

    homePrinter() {
        this.$store.dispatch('server/addEvent', { message: "G28", type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "G28" }, { loading: 'homeAll' })
    }

    clearBedMesh() {
        this.$store.dispatch('server/addEvent', { message: "BED_MESH_CLEAR", type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "BED_MESH_CLEAR" }, { loading: 'bedMeshClear' })
    }

    calibrateMesh() {
        this.calibrateDialog = false;
        this.$store.dispatch('server/addEvent', { message: "BED_MESH_CALIBRATE", type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "BED_MESH_CALIBRATE" }, { loading: 'bedMeshCalibrate' })
    }

    beforeDestroy() {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }
}
</script>