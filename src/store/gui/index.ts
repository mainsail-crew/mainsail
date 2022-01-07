import { GuiState } from '@/store/gui/types'
import { Module } from 'vuex'
import { actions } from '@/store/gui/actions'
import { mutations } from '@/store/gui/mutations'
import { getters } from '@/store/gui/getters'
import {defaultLogoColor, defaultPrimaryColor} from '@/store/variables'

// load modules
import { console } from '@/store/gui/console'
import { gcodehistory } from '@/store/gui/gcodehistory'
import { macros } from '@/store/gui/macros'
import { presets } from '@/store/gui/presets'
import { remoteprinters } from '@/store/gui/remoteprinters'
import { webcams } from '@/store/gui/webcams'

export const getDefaultState = (): GuiState => {
    return {
        general: {
            printername: '',
            language: 'en',
            calcEstimateTime: ['file', 'filament'],
            calcEtaTime: ['file', 'filament', 'slicer']
        },
        control: {
            style: 'bars',
            feedrateXY: 100,
            stepsXY: [ 100, 10, 1 ],
            feedrateZ: 25,
            stepsZ: [ 25, 1, 0.1 ],
            stepsAll: [0.1, 1, 10, 25, 50, 100],
            stepsCircleXY: [1, 10, 50, 100],
            stepsCircleZ: [0.1, 1, 10, 50],
            selectedCrossStep: null,
            reverseX: false,
            reverseY: false,
            reverseZ: false,
            extruder: {
                feedamount: 25,
                feedamounts: [ 50, 25, 10, 5, 1 ],
                feedrate: 5,
                feedrates: [ 15, 10, 5, 2, 1 ],
            },
        },
        dashboard: {
            nonExpandPanels: [],
            mobileLayout: [
                { 'name': 'webcam', visible: false },
                { 'name': 'zoffset', visible: true },
                { 'name': 'control', visible: true },
                { 'name': 'macros', visible: true },
                { 'name': 'printsettings', visible: true },
                { 'name': 'machine-settings', visible: true },
                { 'name': 'miscellaneous', visible: true },
                { 'name': 'tools', visible: true },
                { 'name': 'miniconsole', visible: false },
            ],
            tabletLayout1: [
                { 'name': 'webcam', visible: true  },
                { 'name': 'zoffset', visible: true  },
                { 'name': 'control', visible: true  },
                { 'name': 'macros', visible: true },
                { 'name': 'printsettings', visible: true  },
                { 'name': 'machine-settings', visible: true },
                { 'name': 'miscellaneous', visible: true  },
            ],
            tabletLayout2: [
                { 'name': 'tools', visible: true },
                { 'name': 'miniconsole', visible: true },
            ],
            desktopLayout1: [
                { 'name': 'webcam', visible: true },
                { 'name': 'zoffset', visible: true },
                { 'name': 'control', visible: true },
                { 'name': 'macros', visible: true },
                { 'name': 'printsettings', visible: true },
                { 'name': 'machine-settings', visible: true },
                { 'name': 'miscellaneous', visible: true },
            ],
            desktopLayout2: [
                { 'name': 'tools', visible: true },
                { 'name': 'miniconsole', visible: true },
            ],
            widescreenLayout1: [
                { 'name': 'zoffset', visible: true },
                { 'name': 'control', visible: true },
                { 'name': 'macros', visible: true },
                { 'name': 'miscellaneous', visible: true },
            ],
            widescreenLayout2: [
                { 'name': 'tools', visible: true },
                { 'name': 'printsettings', visible: true },
                { 'name': 'machine-settings', visible: true },
            ],
            widescreenLayout3: [
                { 'name': 'webcam', visible: true },
                { 'name': 'miniconsole', visible: true },
            ],
        },
        editor: {
            escToClose: true,
            confirmUnsavedChanges: true
        },
        gcodeViewer: {
            extruderColors : ['#E76F51FF','#F4A261FF','#E9C46AFF','#2A9D8FFF','#264653FF'],
            gridColor : '#B3B3B3',
            backgroundColor : '#121212',
            colorMode : 2,
            showAxes : true,
            minFeed : 20,
            maxFeed : 100,
            minFeedColor : '#2196f3',
            maxFeedColor : '#D41216',
            progressColor : '#FFFFFFB2',
            showCursor: true,
            showTravelMoves: false,
            showObjectSelection: false,
            hdRendering: false,
            forceLineRendering: false,
            transparency: false,
            voxelMode: false,
            voxelWidth: 1,
            voxelHeight: 1,
            specularLighting: false,
        },
        uiSettings: {
            logo: defaultLogoColor,
            primary: defaultPrimaryColor,
            displayCancelPrint: false,
            displayZOffsetStandby: false,
            lockSlidersOnTouchDevices: true,
            lockSlidersDelay: 1.5,
            confirmOnEmergencyStop: false,
            confirmOnPowerDeviceChange: false,
            boolBigThumbnail: true,
            boolWideNavDrawer: false,
            boolHideUploadAndPrintButton: false,
            boolWebcamNavi: false,
            navigationStyle: 'iconsAndText',
        },
        view: {
            configfiles: {
                countPerPage: 10,
                sortBy: 'filename',
                sortDesc: false,
                showHiddenFiles: false,
                hideBackupFiles: false,
                currentPath: '',
                rootPath: 'config'
            },
            gcodefiles: {
                countPerPage: 10,
                sortBy: 'modified',
                sortDesc: true,
                showHiddenFiles: false,
                showPrintedFiles: true,
                hideMetadataColums: [],
                currentPath: 'gcodes'
            },
            heightmap: {
                probed: true,
                mesh: false,
                flat: false,
                wireframe: true,
                scale: 0.5,
                scaleVisualMap: false,
            },
            history: {
                countPerPage: 10,
                toggleChartCol3: 'filament_usage',
                hidePrintStatus: [],
                hideColums: [
                    'size',
                    'modified',
                    'end_time',
                    'total_duration',
                    'filament_total',
                    'first_layer_extr_temp',
                    'first_layer_bed_temp',
                    'first_layer_height',
                    'layer_height',
                    'object_height',
                ]
            },
            jobqueue: {
                countPerPage: 10,
            },
            lockedSliders: [],
            tempchart: {
                boolTempchart: true,
                hiddenDataset: [],
                autoscale: false,
                datasetSettings: { },
            },
            timelapse: {
                countPerPage: 10,
                sortBy: 'modified',
                sortDesc: true,
                showHiddenFiles: false,
                currentPath: 'timelapse'
            },
            webcam: {
                currentCam: {
                    dashboard: 'all',
                    page: 'all'
                },
            },
        },
    }
}

// initial state
const state = getDefaultState()

export const gui: Module<GuiState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        console,
        gcodehistory,
        macros,
        presets,
        remoteprinters,
        webcams,
    }
}
