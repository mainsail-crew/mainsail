import { GuiState } from '@/store/gui/types'
import { Module } from 'vuex'
import { actions } from '@/store/gui/actions'
import { mutations } from '@/store/gui/mutations'
import { getters } from '@/store/gui/getters'
import {defaultLogoColor, defaultPrimaryColor} from '@/store/variables'

export const getDefaultState = (): GuiState => {
    return {
        general: {
            printername: '',
            language: 'en',
            displayCancelPrint: false,
            displayZOffsetStandby: false,
            confirmOnEmergencyStop: false,
            confirmOnPowerDeviceChange: false,
            calcEstimateTime: ['file', 'filament'],
            calcEtaTime: ['file', 'filament', 'slicer'],
        },
        theme: {
            logo: defaultLogoColor,
            primary: defaultPrimaryColor,
        },
        dashboard: {
            boolTempchart: true,
            boolBigThumbnail: true,
            macroManagement: 'simple',
            hiddenMacros: [],
            macrogroups: [],
            hiddenTempChart: [],
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
                reverseZ: false
            },
            extruder: {
                feedamount: 25,
                feedamounts: [ 50, 25, 10, 5, 1 ],
                feedrate: 5,
                feedrates: [ 60, 30, 15, 5, 1 ],
            },
            mobileLayout: [
                { 'name': 'webcam', visable: false },
                { 'name': 'zoffset', visable: true },
                { 'name': 'control', visable: true },
                { 'name': 'macros', visable: true },
                { 'name': 'printsettings', visable: true },
                { 'name': 'miscellaneous', visable: true },
                { 'name': 'tools', visable: true },
                { 'name': 'miniconsole', visable: false },
            ],
            tabletLayout1: [
                { 'name': 'webcam', visable: true  },
                { 'name': 'zoffset', visable: true  },
                { 'name': 'control', visable: true  },
                { 'name': 'macros', visable: true },
                { 'name': 'printsettings', visable: true  },
                { 'name': 'miscellaneous', visable: true  },
            ],
            tabletLayout2: [
                { 'name': 'tools', visable: true },
                { 'name': 'miniconsole', visable: true },
            ],
            desktopLayout1: [
                { 'name': 'webcam', visable: true },
                { 'name': 'zoffset', visable: true },
                { 'name': 'control', visable: true },
                { 'name': 'macros', visable: true },
                { 'name': 'printsettings', visable: true },
                { 'name': 'miscellaneous', visable: true },
            ],
            desktopLayout2: [
                { 'name': 'tools', visable: true },
                { 'name': 'miniconsole', visable: true },
            ],
            widescreenLayout1: [
                { 'name': 'zoffset', visable: true },
                { 'name': 'control', visable: true },
                { 'name': 'macros', visable: true },
                { 'name': 'miscellaneous', visable: true },
            ],
            widescreenLayout2: [
                { 'name': 'tools', visable: true },
                { 'name': 'printsettings', visable: true },
            ],
            widescreenLayout3: [
                { 'name': 'webcam', visable: true },
                { 'name': 'miniconsole', visable: true },
            ],
            nonExpandPanels: []
        },
        webcam: {
            selectedCam: '',
            boolDashboard: false,
            boolNavi: false,
            configs: [{
                name: 'Default',
                icon: 'mdi-webcam',
                service: 'mjpegstreamer-adaptive',
                targetFps: 15,
                url: '/webcam/?action=stream',
                flipX: false,
                flipY: false,
            }],
        },
        tempchart: {
            autoscale: false,
            datasetSettings: {

            },
        },
        console: {
            hideWaitTemperatures: true,
            direction: 'table',
            height: 300,
            customFilters: [],
        },
        gcodefiles: {
            countPerPage: 10,
            sortBy: 'modified',
            sortDesc: true,
            showHiddenFiles: false,
            showPrintedFiles: true,
            hideMetadataColums: []
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
        settings: {
            configfiles: {
                countPerPage: 10,
                sortBy: 'filename',
                sortDesc: false,
                showHiddenFiles: false,
                hideBackupFiles: false
            }
        },
        editor: {
            minimap: false
        },
        //moonraker DB api dont accept camel case key names
        remotePrinters: [],
        presets: [],
        cooldownGcode: 'TURN_OFF_HEATERS',
        gcodeViewer: {
            extruderColors : ['#00FFFFFF','#FF00FFFF','#FFFF00FF','#000000FF','#FFFFFFFF'],
            gridColor : '#0000FF',
            backgroundColor : '#000000',
            colorMode : 2,
            showAxes : 'true',
            minFeed : 20,
            maxFeed : 100,
            minFeedColor : '#0000FF',
            maxFeedColor : '#FF0000',
            progressColor : '#FFFFFF',
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
        }
    }
}

// initial state
const state = getDefaultState()

export const gui: Module<GuiState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
