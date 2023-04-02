<template>
    <div>
        <v-row v-if="klipperReadyForGui">
            <v-col class="col-12 col-md-8 pb-0">
                <panel card-class="heightmap-map-panel" :title="$t('Heightmap.Heightmap').toString()" :icon="mdiGrid">
                    <template #buttons>
                        <v-btn
                            icon
                            tile
                            class="d-none d-sm-flex"
                            :disabled="printerIsPrinting"
                            :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                            :loading="loadings.includes('homeAll')"
                            :title="$t('Heightmap.TitleHomeAll')"
                            :ripple="true"
                            @click="homePrinter">
                            <v-icon>{{ mdiHome }}</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="meshLoaded"
                            text
                            tile
                            class="d-none d-sm-flex"
                            :loading="loadings.includes('bedMeshClear')"
                            :title="$t('Heightmap.TitleClear')"
                            @click="clearBedMesh">
                            {{ $t('Heightmap.Clear') }}
                        </v-btn>
                        <v-btn
                            text
                            tile
                            class="d-none d-sm-flex"
                            :loading="loadings.includes('bedMeshCalibrate')"
                            :disabled="printerIsPrinting"
                            :title="$t('Heightmap.TitleCalibrate')"
                            @click="openCalibrateMesh">
                            {{ $t('Heightmap.Calibrate') }}
                        </v-btn>
                    </template>
                    <v-card-text class="d-sm-none text-center pb-0">
                        <v-item-group tile class="v-btn-toggle" name="controllers">
                            <v-btn
                                text
                                small
                                class="px-2 minwidth-0"
                                :disabled="printerIsPrinting"
                                :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                                :loading="loadings.includes('homeAll')"
                                :title="$t('Heightmap.TitleHomeAll')"
                                @click="homePrinter">
                                <v-icon :color="homedAxes.includes('xyz') ? 'primary' : 'warning'" small>
                                    {{ mdiHome }}
                                </v-icon>
                            </v-btn>
                            <v-btn
                                v-if="bed_mesh"
                                text
                                small
                                class="px-2 minwidth-0"
                                color="primary"
                                :loading="loadings.includes('bedMeshClear')"
                                :title="$t('Heightmap.TitleClear')"
                                @click="clearBedMesh">
                                {{ $t('Heightmap.Clear') }}
                            </v-btn>
                            <v-btn
                                text
                                small
                                class="px-2 minwidth-0"
                                color="primary"
                                :loading="loadings.includes('bedMeshCalibrate')"
                                :disabled="printerIsPrinting"
                                :title="$t('Heightmap.TitleCalibrate')"
                                @click="openCalibrateMesh">
                                {{ $t('Heightmap.Calibrate') }}
                            </v-btn>
                        </v-item-group>
                    </v-card-text>
                    <template v-if="!meshLoaded">
                        <v-card-text class="text-center py-3 font-italic">
                            {{ $t('Heightmap.NoBedMeshHasBeenLoadedYet') }}
                        </v-card-text>
                    </template>
                    <template v-else>
                        <v-card-text class="py-0 px-0">
                            <v-row>
                                <v-col class="">
                                    <e-chart
                                        ref="heightmap"
                                        :option="chartOptions"
                                        :init-options="{ renderer: 'canvas' }"
                                        style="height: 400px; width: 100%; overflow: hidden"></e-chart>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col
                                    class="col-12 col-sm-auto pt-0 pb-0 pl-lg-6 d-flex justify-center justify-sm-start">
                                    <v-switch
                                        v-model="scaleGradient"
                                        :label="$t('Heightmap.ScaleGradient')"
                                        class="mt-0 ml-5"></v-switch>
                                </v-col>
                                <v-col class="d-flex justify-center pt-0 pb-6 pb-lg-3">
                                    <v-checkbox
                                        v-model="showProbed"
                                        :label="$t('Heightmap.Probed')"
                                        hide-details
                                        class="mx-3 mt-0"></v-checkbox>
                                    <v-checkbox
                                        v-model="showMesh"
                                        :label="$t('Heightmap.Mesh')"
                                        hide-details
                                        class="mx-3 mt-0"></v-checkbox>
                                    <v-checkbox
                                        v-model="showFlat"
                                        :label="$t('Heightmap.Flat')"
                                        hide-details
                                        class="mx-3 mt-0"></v-checkbox>
                                    <v-checkbox
                                        v-model="wireframe"
                                        :label="$t('Heightmap.Wireframe')"
                                        hide-details
                                        class="mx-3 mt-0"></v-checkbox>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-text class="pt-0 pb-3">
                            <v-row>
                                <v-col>
                                    <v-slider
                                        v-model="scaleZMax"
                                        :label="$t('Heightmap.ScaleZMax')"
                                        :min="heightmapRangeLimit[0]"
                                        :max="heightmapRangeLimit[1]"
                                        :step="0.1"
                                        ticks="always"
                                        class="mt-4"
                                        hide-details></v-slider>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </template>
                </panel>
            </v-col>
            <v-col class="col-12 col-md-4">
                <panel
                    v-if="currentProfile"
                    :title="$t('Heightmap.CurrentMesh.Headline').toString()"
                    card-class="heightmap-current-mesh-panel"
                    :icon="mdiInformation"
                    :collapsible="true"
                    class="mt-0">
                    <v-card-text class="py-3 px-0">
                        <v-row class="px-3">
                            <v-col>{{ $t('Heightmap.CurrentMesh.Name') }}</v-col>
                            <v-col class="text-right">
                                <span class="currentMeshName font-weight-bold" @click="openRenameProfile()">
                                    <v-icon left small color="primary">{{ mdiPencil }}</v-icon>
                                    {{ currentProfileName }}
                                </span>
                            </v-col>
                        </v-row>
                        <v-divider class="my-3"></v-divider>
                        <v-row v-if="'data' in currentProfile" class="px-3">
                            <v-col>{{ $t('Heightmap.CurrentMesh.Size') }}</v-col>
                            <v-col class="text-right">
                                {{ currentProfile.data.x_count }}x{{ currentProfile.data.y_count }}
                            </v-col>
                        </v-row>
                        <v-divider class="my-3"></v-divider>
                        <v-row class="px-3">
                            <v-col>
                                {{ $t('Heightmap.CurrentMesh.Max') }} [{{ bedMeshMaxPoint.positionX }},
                                {{ bedMeshMaxPoint.positionY }}]
                            </v-col>
                            <v-col class="text-right">{{ currentProfile.max.toFixed(3) }} mm</v-col>
                        </v-row>
                        <v-divider class="my-3"></v-divider>
                        <v-row class="px-3">
                            <v-col>
                                {{ $t('Heightmap.CurrentMesh.Min') }} [{{ bedMeshMinPoint.positionX }},
                                {{ bedMeshMinPoint.positionY }}]
                            </v-col>
                            <v-col class="text-right">{{ currentProfile.min.toFixed(3) }} mm</v-col>
                        </v-row>
                        <v-divider class="my-3"></v-divider>
                        <v-row class="px-3">
                            <v-col>{{ $t('Heightmap.CurrentMesh.Range') }}</v-col>
                            <v-col class="text-right">{{ currentProfile.variance.toFixed(3) }} mm</v-col>
                        </v-row>
                    </v-card-text>
                </panel>
                <panel
                    :title="$t('Heightmap.Profiles').toString()"
                    card-class="heightmap-profiles-panel"
                    :icon="mdiStackOverflow"
                    :collapsible="true"
                    class="mt-6 mt-md-0">
                    <v-card-text v-if="profiles.length" class="px-0 py-3">
                        <template v-for="(profile, index) in profiles">
                            <v-divider v-if="index" :key="'deliver_' + index" class="my-3"></v-divider>
                            <v-row :key="index" class="rowProfile">
                                <v-col class="pl-6 py-0 colName">
                                    <span
                                        :class="profile.is_active ? 'current' : ''"
                                        style="cursor: pointer"
                                        @click="profile.is_active ? openRenameProfile() : loadProfile(profile.name)">
                                        {{ profile.name }}
                                    </span>
                                </v-col>
                                <v-col class="text-center py-0 colVariance">
                                    <v-tooltip top color="rgba(0,0,0,0.8)">
                                        <template #activator="{ on, attrs }">
                                            <small v-bind="attrs" v-on="on">
                                                {{ profile.variance.toFixed(3) }}
                                            </small>
                                        </template>
                                        <span>
                                            max: {{ profile.max }}
                                            <br />
                                            min: {{ profile.min }}
                                        </span>
                                    </v-tooltip>
                                </v-col>
                                <v-col class="py-0 colActions">
                                    <v-btn
                                        v-if="!profile.is_active"
                                        text
                                        tile
                                        class="px-2 minwidth-0"
                                        :loading="loadings.includes('bedMeshLoad_' + profile.name)"
                                        @click="loadProfile(profile.name)">
                                        <v-icon>{{ mdiProgressUpload }}</v-icon>
                                    </v-btn>
                                    <v-btn
                                        v-else
                                        text
                                        tile
                                        class="px-2 minwidth-0"
                                        :loading="loadings.includes('bedMeshLoad_' + profile.name)"
                                        @click="openRenameProfile">
                                        <v-icon>{{ mdiPencil }}</v-icon>
                                    </v-btn>
                                    <v-btn
                                        text
                                        tile
                                        class="px-2 minwidth-0"
                                        :loading="loadings.includes('bedMeshRemove_' + profile.name)"
                                        :title="$t('Heightmap.DeleteBedMeshProfile')"
                                        @click="openRemoveProfile(profile.name)">
                                        <v-icon>{{ mdiDelete }}</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </template>
                    </v-card-text>
                    <v-card-text v-else>
                        <p class="mb-0">{{ $t('Heightmap.NoProfile') }}</p>
                    </v-card-text>
                </panel>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-alert
                dense
                text
                type="warning"
                elevation="2"
                class="mx-auto mt-6"
                max-width="500"
                :icon="mdiLockOutline">
                {{ $t('Heightmap.ErrorKlipperNotReady') }}
            </v-alert>
        </v-row>
        <v-dialog v-model="renameDialog" persistent :max-width="400" @keydown.esc="renameDialog = false">
            <panel
                :title="$t('Heightmap.RenameBedMeshProfile').toString()"
                :icon="mdiGrid"
                card-class="heightmap-rename-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="renameDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialogRenameHeightmapName"
                        v-model="newName"
                        :label="$t('Heightmap.Name')"
                        required
                        :rules="renameInputRules"
                        @update:error="
                            (bool) => {
                                isInvalidName = bool
                            }
                        "
                        @keyup.enter="renameProfile" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="renameDialog = false">{{ $t('Heightmap.Abort') }}</v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="renameProfile">
                        {{ $t('Heightmap.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog
            v-model="calibrateDialog.boolShow"
            persistent
            :max-width="400"
            @keydown.esc="calibrateDialog.boolShow = false">
            <panel
                :title="$t('Heightmap.BedMeshCalibrate').toString()"
                :icon="mdiGrid"
                card-class="heightmap-calibrate-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="calibrateDialog.boolShow = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputFieldCalibrateBedMeshName"
                        v-model="calibrateDialog.name"
                        :label="$t('Heightmap.Name')"
                        :rules="createInputRules"
                        required
                        @update:error="
                            (bool) => {
                                calibrateDialog.isInvalidName = bool
                            }
                        "
                        @keyup.enter="calibrateMesh" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="calibrateDialog.boolShow = false">{{ $t('Heightmap.Abort') }}</v-btn>
                    <v-btn :disabled="calibrateDialog.isInvalidName" color="primary" text @click="calibrateMesh">
                        {{ $t('Heightmap.Calibrate') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="removeDialog" persistent :max-width="400" @keydown.esc="removeDialog = false">
            <panel
                :title="$t('Heightmap.BedMeshRemove').toString()"
                :icon="mdiGrid"
                card-class="heightmap-remove-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="removeDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">{{ $t('Heightmap.DoYouReallyWantToDelete', { name: removeDialogProfile }) }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="removeDialog = false">{{ $t('Heightmap.Abort') }}</v-btn>
                    <v-btn color="error" text @click="removeProfile">{{ $t('Heightmap.Remove') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="saveConfigDialog" persistent :max-width="400" @keydown.esc="saveConfigDialog = false">
            <panel
                :title="$t('Heightmap.SAVE_CONFIG').toString()"
                :icon="mdiGrid"
                card-class="heightmap-remove-save-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="saveConfigDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">{{ $t('Heightmap.RemoveSaveDescription') }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <template v-if="printerIsPrinting">
                        <v-btn text @click="saveConfigDialog = false">{{ $t('Heightmap.Ok') }}</v-btn>
                    </template>
                    <template v-else>
                        <v-btn color="primary" text @click="saveConfig">
                            {{ $t('Heightmap.SAVE_CONFIG') }}
                        </v-btn>
                        <v-btn text @click="saveConfigDialog = false">{{ $t('Heightmap.Later') }}</v-btn>
                    </template>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'

import Panel from '@/components/ui/Panel.vue'
import {
    mdiCloseThick,
    mdiDelete,
    mdiGrid,
    mdiHome,
    mdiInformation,
    mdiLockOutline,
    mdiProgressUpload,
    mdiPencil,
    mdiStackOverflow,
} from '@mdi/js'

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
import { PrinterStateBedMesh } from '@/store/printer/types'

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

@Component({
    components: {
        Panel,
    },
})
export default class PageHeightmap extends Mixins(BaseMixin, ControlMixin) {
    declare $refs: {
        // eslint-disable-next-line
        heightmap: any
        inputDialogRenameHeightmapName: HTMLInputElement
        inputFieldCalibrateBedMeshName: HTMLInputElement
    }

    /**
     * Icons
     */
    mdiGrid = mdiGrid
    mdiHome = mdiHome
    mdiInformation = mdiInformation
    mdiStackOverflow = mdiStackOverflow
    mdiLockOutline = mdiLockOutline
    mdiCloseThick = mdiCloseThick
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete
    mdiProgressUpload = mdiProgressUpload

    private renameDialog = false
    private removeDialogProfile = ''
    private removeDialog = false
    private saveConfigDialog = false
    private calibrateDialog: {
        boolShow: boolean
        name: string
        isInvalidName: boolean
    } = {
        boolShow: false,
        name: 'default',
        isInvalidName: false,
    }
    private newName = ''
    private oldName = ''
    private isInvalidName = true
    private createInputRules = [
        (value: string) => !!value || this.$t('Heightmap.InvalidNameEmpty'),
        // eslint-disable-next-line no-control-regex
        (value: string) => value === value.replace(/[^\x00-\x7F]/g, '') || this.$t('Heightmap.InvalidNameAscii'),
    ]
    private renameInputRules = [
        (value: string) => !!value || this.$t('Heightmap.InvalidNameEmpty'),
        (value: string) => value !== 'default' || this.$t('Heightmap.InvalidNameReserved'),
        (value: string) => !this.existsProfileName(value) || this.$t('Heightmap.InvalidNameAlreadyExists'),
        // eslint-disable-next-line no-control-regex
        (value: string) => value === value.replace(/[^\x00-\x7F]/g, '') || this.$t('Heightmap.InvalidNameAscii'),
    ]

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
                    fontSize: '14px',
                },
                padding: 15,
                formatter: this.tooltipFormatter,
            },
            darkMode: true,
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
                    color: [
                        '#313695',
                        '#4575b4',
                        '#74add1',
                        '#abd9e9',
                        '#e0f3f8',
                        '#ffffbf',
                        '#fee090',
                        '#fdae61',
                        '#f46d43',
                        '#d73027',
                        '#a50026',
                    ],
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
                    fontSize: this.fontSizeVisualMap,
                },
            },
            xAxis3D: {
                type: 'value',
                nameTextStyle: {
                    color: this.colorAxisName,
                },
                min: this.rangeX[0],
                max: this.rangeX[1],
                minInterval: 1,
            },
            yAxis3D: {
                type: 'value',
                nameTextStyle: {
                    color: this.colorAxisName,
                },
                min: this.rangeY[0],
                max: this.rangeY[1],
            },
            zAxis3D: {
                type: 'value',
                min: this.scaleZMax * -1,
                max: this.scaleZMax,
                nameTextStyle: {
                    color: this.colorAxisName,
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
                    textStyle: {
                        color: this.colorAxisLabel,
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: this.colorAxisLine,
                    },
                },
                axisTick: {
                    lineStyle: {
                        color: this.colorAxisTick,
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: this.colorSplitLine,
                    },
                },
                axisPointer: {
                    lineStyle: {
                        color: this.colorAxisPointer,
                    },
                    label: {
                        textStyle: {
                            color: this.colorAxisPointer,
                        },
                    },
                },
            },
            series: this.series,
        }
    }

    get chart(): ECharts | null {
        return this.$refs.heightmap?.chart ?? null
    }

    get profiles() {
        return this.$store.getters['printer/getBedMeshProfiles']
    }

    get bed_mesh() {
        return this.$store.state.printer.bed_mesh ?? null
    }

    get currentProfileName() {
        return this.bed_mesh?.profile_name ?? ''
    }

    get currentProfile() {
        return this.profiles.find((profile: PrinterStateBedMesh) => profile.name === this.currentProfileName)
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

    get scaleGradient(): boolean {
        return this.$store.state.gui.view.heightmap.scaleGradient ?? false
    }

    set scaleGradient(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.scaleGradient', value: newVal })
    }

    get scaleZMax(): number {
        return this.$store.state.gui.view.heightmap.scaleZMax ?? 0.5
    }

    set scaleZMax(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.scaleZMax', value: newVal })
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

        if (this.currentProfile) {
            min = this.currentProfile.min
            max = this.currentProfile.max
        }

        return [min, max]
    }

    get heightmapRangeLimit(): number[] {
        const [min, max] = this.heightmapLimit

        const minRange = Math.round(Math.max(Math.abs(min), Math.abs(max)) * 10) / 10
        const maxRange = Math.max(minRange, 1)

        return [minRange, maxRange]
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
            itemStyle: {
                opacity: this.probedOpacity,
            },
            wireframe: {
                show: this.wireframe,
            },
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
            itemStyle: {
                opacity: this.meshOpacity,
            },
            wireframe: {
                show: this.wireframe,
            },
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
                opacity: this.flatOpacity,
            },
            wireframe: {
                show: this.wireframe,
            },
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

            let mesh_min = []
            let mesh_max = []

            if (config.mesh_min && config.mesh_max) {
                // is no delta
                mesh_min = typeof config.mesh_min === 'string' ? config.mesh_min.split(',') : config.mesh_min
                mesh_max = typeof config.mesh_max === 'string' ? config.mesh_max.split(',') : config.mesh_max
            } else {
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

    get visualMapRange(): number[] {
        if (!this.scaleGradient) return [-0.1, 0.1]

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

        const [, max] = this.probedHeightmapLimit

        let row = 0
        let col = 0
        this.bed_mesh.probed_matrix.forEach((rowPoints: number[], index: number) => {
            if (Math.max(...rowPoints) === max) {
                row = index + 1
                col = rowPoints.findIndex((point: number) => point === max) + 1
            }
        })

        const positionX =
            Math.round(
                (this.bed_mesh.mesh_min[0] +
                    ((this.bed_mesh.mesh_max[0] - this.bed_mesh.mesh_min[0]) / this.bed_mesh.probed_matrix[0].length) *
                        (col - 1)) *
                    10
            ) / 10
        const positionY =
            Math.round(
                (this.bed_mesh.mesh_min[1] +
                    ((this.bed_mesh.mesh_max[1] - this.bed_mesh.mesh_min[1]) / this.bed_mesh.probed_matrix.length) *
                        (row - 1)) *
                    10
            ) / 10

        return {
            row,
            col,
            positionX,
            positionY,
            value: max,
        }
    }

    get bedMeshMinPoint() {
        if (this.bed_mesh.profile_name === '') return { row: 0, col: 0, positionX: 0, positionY: 0, value: 0 }

        const [min] = this.probedHeightmapLimit

        let row = 0
        let col = 0
        this.bed_mesh.probed_matrix.forEach((rowPoints: number[], index: number) => {
            if (Math.min(...rowPoints) === min) {
                row = index + 1
                col = rowPoints.findIndex((point: number) => point === min) + 1
            }
        })

        const positionX =
            Math.round(
                (this.bed_mesh.mesh_min[0] +
                    ((this.bed_mesh.mesh_max[0] - this.bed_mesh.mesh_min[0]) / this.bed_mesh.probed_matrix[0].length) *
                        (col - 1)) *
                    10
            ) / 10
        const positionY =
            Math.round(
                (this.bed_mesh.mesh_min[1] +
                    ((this.bed_mesh.mesh_max[1] - this.bed_mesh.mesh_min[1]) / this.bed_mesh.probed_matrix.length) *
                        (row - 1)) *
                    10
            ) / 10

        return {
            row,
            col,
            positionX,
            positionY,
            value: min,
        }
    }

    get meshLoaded() {
        if (this.bed_mesh !== null) {
            return this.bed_mesh.profile_name !== ''
        } else {
            return false
        }
    }

    tooltipFormatter(data: any): string {
        const outputArray: string[] = []
        outputArray.push('<b>' + data.seriesName + '</b>')

        Object.keys(data.encode)
            .sort()
            .forEach((axisName: string) => {
                outputArray.push(
                    '<b>' +
                        axisName.toUpperCase() +
                        '</b>: ' +
                        data.data[data.encode[axisName][0]].toFixed(axisName === 'z' ? 3 : 1) +
                        ' mm'
                )
            })

        return outputArray.join('<br />')
    }

    loadProfile(name: string): void {
        const gcode = 'BED_MESH_PROFILE LOAD="' + name + '"'

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'bedMeshLoad_' + name })
    }

    openRenameProfile(): void {
        this.newName = this.bed_mesh?.profile_name ?? ''
        this.oldName = this.bed_mesh.profile_name
        this.renameDialog = true
        this.isInvalidName = false

        setTimeout(() => {
            this.$refs.inputDialogRenameHeightmapName?.focus()
        }, 200)
    }

    existsProfileName(name: string) {
        return this.profiles.findIndex((profile: { name: string }) => profile.name === name) >= 0
    }

    renameProfile(): void {
        this.renameDialog = false
        const gcodeNew = 'BED_MESH_PROFILE SAVE="' + this.newName + '"'
        const gcodeOld = 'BED_MESH_PROFILE REMOVE="' + this.oldName + '"'

        this.$store.dispatch('server/addEvent', {
            message: gcodeNew,
            type: 'command',
        })
        this.$store.dispatch('server/addEvent', {
            message: gcodeOld,
            type: 'command',
        })

        this.$socket.emit('printer.gcode.script', { script: gcodeNew }, { loading: 'bedMeshRename' })
        this.$socket.emit('printer.gcode.script', { script: gcodeOld }, { loading: 'bedMeshRename' })

        this.newName = ''
        this.oldName = ''
    }

    openRemoveProfile(name: string): void {
        this.removeDialogProfile = name
        this.removeDialog = true
    }

    removeProfile(): void {
        this.removeDialog = false
        const gcode = 'BED_MESH_PROFILE REMOVE="' + this.removeDialogProfile + '"'

        this.$store.dispatch('server/addEvent', {
            message: gcode,
            type: 'command',
        })
        this.$socket.emit(
            'printer.gcode.script',
            { script: gcode },
            {
                action: 'printer/removeBedMeshProfile',
                actionPayload: { name: this.removeDialogProfile },
                loading: 'bedMeshRename_' + this.removeDialogProfile,
            }
        )
        this.removeDialogProfile = ''

        this.saveConfigDialog = true
    }

    homePrinter(): void {
        const gcode = 'G28'

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'homeAll' })
    }

    clearBedMesh(): void {
        const gcode = 'BED_MESH_CLEAR'

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'bedMeshClear' })
    }

    openCalibrateMesh() {
        this.calibrateDialog.name = 'default'
        this.calibrateDialog.boolShow = true

        setTimeout(() => {
            this.$refs.inputFieldCalibrateBedMeshName?.focus()
        }, 200)
    }

    calibrateMesh(): void {
        this.calibrateDialog.boolShow = false
        const gcode = 'BED_MESH_CALIBRATE PROFILE="' + this.calibrateDialog.name + '"'
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'bedMeshCalibrate' })
    }

    saveConfig() {
        const gcode = 'SAVE_CONFIG'
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'topbarSaveConfig' })
        this.saveConfigDialog = false
    }

    beforeDestroy(): void {
        if (typeof window === 'undefined') return
        if (this.chart) this.chart.dispose()
    }
}
</script>

<style scoped>
.rename-profile {
    text-transform: none;
}

.currentMeshName {
    cursor: pointer;
    color: var(--v-primary-base);
}

.currentMeshName .v-icon {
    opacity: 0;
}

.currentMeshName:hover .v-icon {
    opacity: 1;
}

.rowProfile {
}

.rowProfile .colActions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
}

.rowProfile .colName,
.rowProfile .colVariance {
    line-height: 48px;
}

.rowProfile .colName span.current {
    font-weight: bold;
    color: var(--v-primary-base);
}

.rowProfile .colActions .v-btn {
    height: 48px;
    width: 48px;
}
</style>
