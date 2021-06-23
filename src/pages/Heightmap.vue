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
                                        style="height: 500px; width: 100%; overflow: auto;"
                                    ></ECharts>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-text class="pt-5 pb-0">
                            <v-row>
                                <v-col class="col-6">
                                    <h3>{{ $t('Heightmap.Probed') }}</h3>
                                    <v-checkbox v-model="showProbed" :label="$t('Heightmap.ShowInHeightmap')" hide-details ></v-checkbox>
                                    <v-checkbox v-model="probedWireframe" :label="$t('Heightmap.Wireframe')" hide-details ></v-checkbox>
                                    <v-slider :label="$t('Heightmap.Opacity')" max="1" min="0" v-model="probedOpacity" class="mt-5" :step="0.1"></v-slider>
                                </v-col>
                                <v-col class="col-6">
                                    <h3>{{ $t('Heightmap.Mesh') }}</h3>
                                    <v-checkbox v-model="showMesh" :label="$t('Heightmap.ShowInHeightmap')" hide-details ></v-checkbox>
                                    <v-checkbox v-model="meshWireframe" :label="$t('Heightmap.Wireframe')" hide-details ></v-checkbox>
                                    <v-slider :label="$t('Heightmap.Opacity')" max="1" min="0" v-model="meshOpacity" class="mt-5" :step="0.1"></v-slider>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-text class="pt-5 pb-0">
                            <v-row>
                                <v-col class="col-6">
                                    <h3>{{ $t('Heightmap.Flat') }}</h3>
                                    <v-checkbox v-model="showFlat" :label="$t('Heightmap.ShowInHeightmap')" hide-details ></v-checkbox>
                                    <v-checkbox v-model="flatWireframe" :label="$t('Heightmap.Wireframe')" hide-details ></v-checkbox>
                                    <v-slider :label="$t('Heightmap.Opacity')" max="1" min="0" v-model="flatOpacity" class="mt-5" :step="0.1"></v-slider>
                                </v-col>
                                <v-col class="col-6">
                                    <h3>{{ $t('Heightmap.General') }}</h3>
                                    <v-range-slider :label="$t('Heightmap.Range')" :min="heightmapRangeLimit[0]" :max="heightmapRangeLimit[1]" v-model="heightmapRange" :step="0.01" ticks="always" ></v-range-slider>
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

    private heightmapRange = [-0.2, 0.2]

    private showProbed = true
    private probedWireframe = true
    private probedOpacity = 1

    private showMesh = true
    private meshWireframe = true
    private meshOpacity = 1

    private showFlat = true
    private flatWireframe = true
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
            tooltip: {},
            darkMode: true,
            animation: false,
            legend: {
                show: false,
                selected: this.selected
            },
            visualMap: {
                show: true,
                min: this.heightmapRange[0],
                max: this.heightmapRange[1],
                calculable: true,
                dimension: 2,
                inRange: {
                    color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                },
                seriesIndex: 0,
                left: 20,
                top: 20,
                bottom: 20,
                itemWidth: 30,
                itemHeight: 430,
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
                min: this.heightmapRange[0],
                max: this.heightmapRange[1],
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
                viewControl: {
                    //projection: 'orthographic'
                },
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
        window.console.log("update")
        this.chart?.setOption(this.chartOptions)
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

    get heightmapRangeLimit() {
        let min = -0.2
        let max = 0.2

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
    @Watch('series', { deep: true })
    seriesChanged() {
        this.chart?.setOption(this.chartOptions)
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
                show: this.probedWireframe
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
                show: this.meshWireframe,
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
                show: this.flatWireframe
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

    loadProfile(name: string) {
        this.$store.commit('socket/addLoading', { name: 'bedMeshLoad_'+name })
        this.$store.commit('server/addEvent', { message: "BED_MESH_PROFILE LOAD="+name, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "BED_MESH_PROFILE LOAD="+name }, "socket/removeLoading", { name: 'bedMeshLoad_'+name })
    }

    openRenameProfile() {
        this.newName = this.bed_mesh?.profile_name ?? ""
        this.renameDialog = true
    }

    renameProfile() {
        this.renameDialog = false
        this.$store.commit('socket/addLoading', { name: 'bedMeshRename' })
        this.$store.commit('server/addEvent', { message: "BED_MESH_PROFILE SAVE="+this.newName.toUpperCase(), type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "BED_MESH_PROFILE SAVE="+this.newName.toUpperCase() }, "socket/removeLoading", { name: 'bedMeshRename' })
    }

    openRemoveProfile(name: string) {
        this.newName = name
        this.removeDialog = true;
    }

    removeProfile() {
        this.removeDialog = false;
        this.$store.commit('socket/addLoading', { name: 'bedMeshRemove_'+this.newName })
        this.$store.commit('server/addEvent', { message: "BED_MESH_PROFILE REMOVE="+this.newName, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "BED_MESH_PROFILE REMOVE="+this.newName }, "printer/removeBedMeshProfile", { name: this.newName })
        this.removeDialogProfile = ""
    }

    homePrinter() {
        this.$store.commit('socket/addLoading', { name: 'homeAll' })
        this.$store.commit('server/addEvent', { message: "G28", type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "G28" }, "socket/removeLoading", { name: 'homeAll' })
    }

    clearBedMesh() {
        this.$store.commit('socket/addLoading', { name: 'bedMeshClear' })
        this.$store.commit('server/addEvent', { message: "BED_MESH_CLEAR", type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "BED_MESH_CLEAR" }, "socket/removeLoading", { name: 'bedMeshClear' })
    }

    calibrateMesh() {
        this.calibrateDialog = false;
        this.$store.commit('socket/addLoading', { name: 'bedMeshCalibrate' })
        this.$store.commit('server/addEvent', { message: "BED_MESH_CALIBRATE", type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: "BED_MESH_CALIBRATE" }, "socket/removeLoading", { name: 'bedMeshCalibrate' })
    }
}
</script>