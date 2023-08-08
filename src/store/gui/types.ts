import { GuiMacrosState } from '@/store/gui/macros/types'
import { GuiConsoleState } from '@/store/gui/console/types'
import { GuiPresetsState } from '@/store/gui/presets/types'
import { GuiRemoteprintersState } from '@/store/gui/remoteprinters/types'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { GuiNotificationState } from '@/store/gui/notifications/types'
import { FileStateFile, FileStateGcodefile } from '@/store/files/types'
import { GuiNavigationState } from '@/store/gui/navigation/types'

export interface GuiState {
    general: {
        printername: string
        language: string
        dateFormat: string | null
        timeFormat: string | null
        calcPrintProgress: 'file-relative' | 'file-absolute' | 'slicer' | 'filament'
        calcEstimateTime: string[] // file, filament are possible values
        calcEtaTime: string[] // file, filament, slicer are possible values
    }
    console?: GuiConsoleState
    control: {
        style: 'bars' | 'circle' | 'cross'
        hideDuringPrint: boolean
        actionButton: null | 'm84' | 'qgl' | 'ztilt'
        enableXYHoming: boolean
        feedrateXY: number
        stepsXY: number[]
        feedrateZ: number
        offsetsZ: number[]
        stepsZ: number[]
        stepsAll: number[]
        stepsCircleXY: number[]
        stepsCircleZ: number[]
        selectedCrossStep: null | number
        reverseX: boolean
        reverseY: boolean
        reverseZ: boolean
        extruder: {
            feedamount: number
            feedamounts: number[]
            feedrate: number
            feedrates: number[]
            showEstimatedExtrusionInfo: boolean
        }
    }
    dashboard: {
        nonExpandPanels: {
            [index: string]: string[]
        }
        mobileLayout: GuiStateLayoutoption[]
        tabletLayout1: GuiStateLayoutoption[]
        tabletLayout2: GuiStateLayoutoption[]
        desktopLayout1: GuiStateLayoutoption[]
        desktopLayout2: GuiStateLayoutoption[]
        widescreenLayout1: GuiStateLayoutoption[]
        widescreenLayout2: GuiStateLayoutoption[]
        widescreenLayout3: GuiStateLayoutoption[]
    }
    editor: {
        escToClose: boolean
        confirmUnsavedChanges: boolean
        klipperRestartMethod: 'FIRMWARE_RESTART' | 'RESTART'
        tabSize: number
    }
    gcodeViewer: {
        extruderColors: string[]
        gridColor: string
        backgroundColor: string
        colorMode: number
        showAxes: boolean
        minFeed: number
        maxFeed: number
        minFeedColor: string
        maxFeedColor: string
        progressColor: string
        showCursor: boolean
        showTravelMoves: boolean
        showObjectSelection: boolean
        hdRendering: boolean
        forceLineRendering: boolean
        transparency: boolean
        voxelMode: boolean
        voxelWidth: number
        voxelHeight: number
        specularLighting: boolean
        klipperCache: {
            kinematics: string | null
            axis_minimum: number[] | null
            axis_maximum: number[] | null
        }
        showGCodePanel: boolean
        cncMode: boolean
    }
    macros?: GuiMacrosState
    navigation: GuiNavigationState
    notifications?: GuiNotificationState
    presets?: GuiPresetsState
    remoteprinters?: GuiRemoteprintersState
    uiSettings: {
        logo: string
        primary: string
        displayCancelPrint: boolean
        lockSlidersOnTouchDevices: boolean
        lockSlidersDelay: number
        confirmOnEmergencyStop: boolean
        confirmOnPowerDeviceChange: boolean
        boolBigThumbnail: boolean
        boolWideNavDrawer: boolean
        boolHideUploadAndPrintButton: boolean
        navigationStyle: 'iconsAndText' | 'iconsOnly'
        defaultNavigationStateSetting: 'alwaysOpen' | 'alwaysClosed' | 'lastState'
        powerDeviceName: string | null
        hideSaveConfigForBedMash: boolean
        disableFanAnimation: boolean
        boolManualProbeDialog: boolean
        boolBedScrewsDialog: boolean
        boolScrewsTiltAdjustDialog: boolean
        tempchartHeight: number
        hideUpdateWarnings: boolean
    }
    view: {
        blockFileUpload: boolean
        configfiles: {
            countPerPage: number
            sortBy: string
            sortDesc: boolean
            showHiddenFiles: boolean
            hideBackupFiles: boolean
            currentPath: string
            rootPath: string
            selectedFiles: FileStateFile[]
        }
        gcodefiles: {
            countPerPage: number
            sortBy: string
            sortDesc: boolean
            showHiddenFiles: boolean
            showPrintedFiles: boolean
            hideMetadataColumns: string[]
            orderMetadataColumns: string[]
            currentPath: string
            selectedFiles: FileStateGcodefile[]
        }
        heightmap: {
            probed: boolean
            mesh: boolean
            flat: boolean
            wireframe: boolean
            scaleGradient: boolean
            scaleZMax: number
        }
        history: {
            countPerPage: number
            toggleChartCol2: 'chart' | 'table'
            toggleChartCol3: string
            hidePrintStatus: string[]
            hideColums: string[]
            selectedJobs: ServerHistoryStateJob[]
        }
        jobqueue: {
            countPerPage: number
        }
        lockedSliders: string[]
        tempchart: {
            boolTempchart: boolean
            hiddenDataset: string[]
            hideMcuHostSensors: boolean
            autoscale: boolean
            datasetSettings: any
        }
        timelapse: {
            countPerPage: number
            sortBy: string
            sortDesc: boolean
            showHiddenFiles: boolean
            currentPath: string
            selectedFiles: FileStateFile[]
        }
        webcam: {
            currentCam: {
                dashboard: string
                page: string
            }
        }
    }
}

export interface GuiStateLayoutoption {
    name: string
    visible: boolean
}
