import { PrinterTempHistoryState } from '@/store/printer/tempHistory/types'

export interface VTextareaType extends HTMLInputElement {
    $refs: {
        input: HTMLTextAreaElement
    }
}

export interface CommandHelp {
    command: string
    commandLow: string
    description?: string | Record<string, unknown>
}

export interface ConsoleCommandHelp {
    command: CommandHelp | null
    original: string
}

export interface PrinterState {
    // eslint-disable-next-line
    [key: string]: any
    helplist?: CommandHelp[]
    tempHistory?: PrinterTempHistoryState
}

export interface PrinterStateHeater {
    name: string
    type: 'extruder' | 'heater_bed' | 'heater_generic'
    icon: string
    iconColor: string
    target: number
    temperature: number
    additionalSensors: PrinterStateAdditionalSensor[]
    power: number
    avgPower: number
    chartColor: string
    chartSeries: string[]
    presets: number[]
    min_temp: number
    max_temp: number
}

export interface PrinterStateTemperatureFan {
    name: string
    icon: string
    target: number
    temperature: number
    additionalSensors: PrinterStateAdditionalSensor[]
    speed: number
    avgSpeed: number
    rpm: number | null
    presets: number[]
    chartColor: string
    chartSeries: string[]
    min_temp: number
    max_temp: number
}

export interface PrinterStateTemperatureSensor {
    name: string
    temperature: number
    additionalSensors: PrinterStateAdditionalSensor[]
    icon: string
    min_temp: number
    max_temp: number
    measured_min_temp: number
    measured_max_temp: number
    chartColor: string
    chartSeries: string[]
}

export interface PrinterStateTemperatureObject {
    name: string
    type: 'extruder' | 'heater_bed' | 'heater_generic' | 'temperature_fan' | 'temperature_sensor'
    icon: string
    iconColor: string
    iconClass: string
    state: string | null
    avgState: string
    temperature: number
    additionalSensors: PrinterStateAdditionalSensor[]
    target: number | null
    presets: number[]
    min_temp: number
    max_temp: number
    measured_min_temp: number | null
    measured_max_temp: number | null
    rpm: number | null
    rpmClass: string
    command: 'SET_HEATER_TEMPERATURE' | 'SET_TEMPERATURE_FAN_TARGET' | null
    commandAttributeName: 'HEATER' | 'TEMPERATURE_FAN' | null
    chartColor: string
    chartSeries: string[]
}

export interface PrinterStateAdditionalSensor {
    bool: boolean
    name: string
    unit: string
    value: number
}

export interface PrinterStateFan {
    name: string
    type: string
    speed: number
    controllable: boolean
}

export interface PrinterStateLight {
    name: string
    type: 'led' | 'neopixel' | 'dotstar' | 'pca9533' | 'pca9632'
    colorOrder: string
    chainCount: number
    initialRed: number | null
    initialGreen: number | null
    initialBlue: number | null
    initialWhite: number | null
    colorData: number[][]
    singleChannelTarget: number | null
}

export interface PrinterStateLight {
    name: string
    type: 'led' | 'neopixel' | 'dotstar' | 'pca9533' | 'pca9632'
    colorOrder: string
    chainCount: number
    initialRed: number | null
    initialGreen: number | null
    initialBlue: number | null
    initialWhite: number | null
    colorData: number[][]
    singleChannelTarget: number | null
}

export interface PrinterStateMiscellaneous {
    name: string
    type: string
    power: number
    controllable: boolean
    pwm: boolean
    rpm: number
    scale: number
    // eslint-disable-next-line
    object: any
    // eslint-disable-next-line
    config: any
    off_below?: number
    max_power?: number
}

export interface PrinterStateFilamentSensors {
    name: string
    enabled: boolean
    filament_detected: boolean
}

export interface PrinterStateBedMesh {
    profile_name: string
    mesh_min: [number, number]
    mesh_max: [number, number]
    probed_matrix: number[][]
    mesh_matrix: number[][]
    profiles: {
        [key: string]: PrinterStateBedMeshProfile
    }
}

export interface PrinterStateBedMeshProfile {
    points: number[][]
    mesh_params: {
        min_x: number
        max_x: number
        min_y: number
        max_y: number
        x_count: number
        y_count: number
        mesh_x_pps: number
        mesh_y_pps: number
        algo: 'bicubic' | 'lagrange'
        tension: number
    }
}

export interface PrinterStateMacroParam {
    type: 'int' | 'double' | 'string' | null
    default: string | null
}

export type PrinterStateMacroParams = {
    [key: string]: PrinterStateMacroParam
} | null

export interface PrinterStateMacro {
    name: string
    description: string | null
    prop: {
        // eslint-disable-next-line
        [key: string]: any
    }
    variables: {
        // eslint-disable-next-line
        [key: string]: any
    }
    params: PrinterStateMacroParams
}

export interface PrinterStateKlipperConfig {
    // eslint-disable-next-line
    [key: string]: any
}

export interface PrinterStateMcu {
    name: string
    mcu_constants: { [key: string]: string | number }
    last_stats: { [key: string]: number }
    version: string
    chip: string | null
    freq: number | null
    freqFormat: string
    awake: string
    load: string
    loadPercent: number
    loadProgressColor: string
    tempSensor: {
        temperature: number
        measured_min_temp: number | null
        measured_max_temp: number | null
    }
}

export interface PrinterStateKlipperConfigWarning {
    message: string
    option: string
    section: string
    type: 'deprecated_value' | 'deprecated_option' | 'runtime_warning'
    value: string
}

export interface PrinterStateExtruder {
    key: string
    name: string
    filamentDiameter: number
    minExtrudeTemp: number
    nozzleDiameter: number
    maxExtrudeOnlyDistance: number
}

export interface PrinterStateExtruderStepper {
    key: string
    name: string
    extruder: number
}

export interface PrinterStateToolchangeMacro {
    name: string
    active: boolean
    color: string
}

export interface PrinterGetterObject {
    name: string
    type: string
    state: {
        [key: string]: any
    }
    config: {
        [key: string]: string
    }
    settings: {
        [key: string]: any
    }
}
