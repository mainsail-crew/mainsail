import { GuiState } from '@/store/gui/types'
import { Module } from 'vuex'
import { actions } from '@/store/gui/actions'
import { mutations } from '@/store/gui/mutations'
import { getters } from '@/store/gui/getters'
import { defaultLogoColor, defaultPrimaryColor } from '@/store/variables'

// load modules
import { console } from '@/store/gui/console'
import { gcodehistory } from '@/store/gui/gcodehistory'
import { macros } from '@/store/gui/macros'
import { miscellaneous } from '@/store/gui/miscellaneous'
import { navigation } from '@/store/gui/navigation'
import { notifications } from '@/store/gui/notifications'
import { presets } from '@/store/gui/presets'
import { remoteprinters } from '@/store/gui/remoteprinters'
import { webcams } from '@/store/gui/webcams'

export const getDefaultState = (): GuiState => {
    return {
        general: {
            printername: '',
            language: 'en',
            dateFormat: null,
            timeFormat: null,
            calcPrintProgress: 'file-relative',
            calcEstimateTime: ['file', 'filament'],
            calcEtaTime: ['file', 'filament', 'slicer'],
        },
        control: {
            style: 'bars',
            actionButton: null,
            hideDuringPrint: false,
            enableXYHoming: false,
            feedrateXY: 100,
            stepsXY: [100, 10, 1],
            feedrateZ: 25,
            offsetsZ: [0.005, 0.01, 0.025, 0.05],
            stepsZ: [25, 1, 0.1],
            stepsAll: [0.1, 1, 10, 25, 50, 100],
            stepsCircleXY: [1, 10, 50, 100],
            stepsCircleZ: [0.1, 1, 10, 50],
            selectedCrossStep: null,
            reverseX: false,
            reverseY: false,
            reverseZ: false,
            extruder: {
                feedamount: 25,
                feedamounts: [50, 25, 10, 5, 1],
                feedrate: 5,
                feedrates: [10, 5, 2, 1],
                showEstimatedExtrusionInfo: true,
            },
        },
        dashboard: {
            nonExpandPanels: {
                mobile: [],
                tablet: [],
                desktop: [],
                widescreen: [],
            },
            mobileLayout: [
                { name: 'webcam', visible: false },
                { name: 'toolhead-control', visible: true },
                { name: 'extruder-control', visible: true },
                { name: 'macros', visible: true },
                { name: 'machine-settings', visible: true },
                { name: 'miscellaneous', visible: true },
                { name: 'temperature', visible: true },
                { name: 'miniconsole', visible: false },
            ],
            tabletLayout1: [
                { name: 'webcam', visible: true },
                { name: 'toolhead-control', visible: true },
                { name: 'extruder-control', visible: true },
                { name: 'macros', visible: true },
                { name: 'machine-settings', visible: true },
                { name: 'miscellaneous', visible: true },
            ],
            tabletLayout2: [
                { name: 'temperature', visible: true },
                { name: 'miniconsole', visible: true },
            ],
            desktopLayout1: [
                { name: 'webcam', visible: true },
                { name: 'toolhead-control', visible: true },
                { name: 'extruder-control', visible: true },
                { name: 'macros', visible: true },
                { name: 'machine-settings', visible: true },
                { name: 'miscellaneous', visible: true },
            ],
            desktopLayout2: [
                { name: 'temperature', visible: true },
                { name: 'miniconsole', visible: true },
            ],
            widescreenLayout1: [
                { name: 'toolhead-control', visible: true },
                { name: 'extruder-control', visible: true },
                { name: 'macros', visible: true },
                { name: 'miscellaneous', visible: true },
            ],
            widescreenLayout2: [
                { name: 'temperature', visible: true },
                { name: 'machine-settings', visible: true },
            ],
            widescreenLayout3: [
                { name: 'webcam', visible: true },
                { name: 'miniconsole', visible: true },
            ],
        },
        editor: {
            escToClose: true,
            confirmUnsavedChanges: true,
            klipperRestartMethod: 'FIRMWARE_RESTART',
            tabSize: 2,
        },
        gcodeViewer: {
            extruderColors: ['#E76F51FF', '#F4A261FF', '#E9C46AFF', '#2A9D8FFF', '#264653FF'],
            gridColor: '#B3B3B3',
            backgroundColor: '#121212',
            colorMode: 2,
            showAxes: true,
            minFeed: 20,
            maxFeed: 100,
            minFeedColor: '#2196f3',
            maxFeedColor: '#D41216',
            progressColor: '#ECECEC',
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
            klipperCache: {
                kinematics: null,
                axis_minimum: null,
                axis_maximum: null,
            },
            showGCodePanel: false,
            cncMode: false,
        },
        navigation: {
            entries: [],
        },
        uiSettings: {
            logo: defaultLogoColor,
            primary: defaultPrimaryColor,
            displayCancelPrint: false,
            lockSlidersOnTouchDevices: true,
            lockSlidersDelay: 1.5,
            confirmOnEmergencyStop: false,
            confirmOnPowerDeviceChange: false,
            boolBigThumbnail: true,
            boolWideNavDrawer: false,
            boolHideUploadAndPrintButton: false,
            navigationStyle: 'iconsAndText',
            defaultNavigationStateSetting: 'alwaysOpen',
            powerDeviceName: null,
            hideSaveConfigForBedMash: false,
            disableFanAnimation: false,
            boolManualProbeDialog: true,
            boolBedScrewsDialog: true,
            boolScrewsTiltAdjustDialog: true,
            tempchartHeight: 250,
            hideUpdateWarnings: false,
        },
        view: {
            blockFileUpload: false,
            configfiles: {
                countPerPage: 10,
                sortBy: 'filename',
                sortDesc: false,
                showHiddenFiles: false,
                hideBackupFiles: false,
                currentPath: '',
                rootPath: 'config',
                selectedFiles: [],
            },
            gcodefiles: {
                countPerPage: 10,
                sortBy: 'modified',
                sortDesc: true,
                showHiddenFiles: false,
                showPrintedFiles: true,
                hideMetadataColumns: [],
                orderMetadataColumns: [
                    'size',
                    'modified',
                    'object_height',
                    'layer_height',
                    'nozzle_diameter',
                    'filament_name',
                    'filament_type',
                    'filament_total',
                    'filament_weight_total',
                    'estimated_time',
                    'last_print_duration',
                    'slicer',
                ],
                currentPath: '',
                selectedFiles: [],
            },
            heightmap: {
                probed: true,
                mesh: false,
                flat: false,
                wireframe: true,
                scaleGradient: false,
                scaleZMax: 0.5,
            },
            history: {
                countPerPage: 10,
                toggleChartCol2: 'chart',
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
                ],
                selectedJobs: [],
            },
            jobqueue: {
                countPerPage: 10,
            },
            lockedSliders: [],
            tempchart: {
                boolTempchart: true,
                hiddenDataset: [],
                hideMcuHostSensors: false,
                autoscale: false,
                datasetSettings: {},
            },
            timelapse: {
                countPerPage: 10,
                sortBy: 'modified',
                sortDesc: true,
                showHiddenFiles: false,
                currentPath: 'timelapse',
                selectedFiles: [],
            },
            webcam: {
                currentCam: {
                    dashboard: 'all',
                    page: 'all',
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
        miscellaneous,
        navigation,
        notifications,
        presets,
        remoteprinters,
        webcams,
    },
}
