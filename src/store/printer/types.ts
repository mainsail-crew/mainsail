import { PrinterTempHistoryState } from '@/store/printer/tempHistory/types'

export interface VTextareaType extends HTMLInputElement {
    $refs: {
        input: HTMLTextAreaElement
    }
}

export interface PrinterState {
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
    tempHistory?: PrinterTempHistoryState
}

export interface EndstopItem {
    type: 'endstop' | 'probe'
    name: string
    value: string
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

export interface PrinterStateMiscellaneous {
    name: string
    type: string
    power: number
    controllable: boolean
    pwm: boolean
    rpm: number
    scale: number
    object: Record<string, unknown>
    config: Record<string, unknown>
    off_below?: number
    max_power?: number
}

export interface PrinterStateMiscellaneousSensor {
    type: string
    name: string
    value: number
    unit: string
}

export interface PrinterStateFilamentSensors {
    type: string
    name: string
    enabled: boolean
    filament_detected: boolean
    filament_diameter?: number
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
        [key: string]: unknown
    }
    variables: {
        [key: string]: unknown
    }
    params: PrinterStateMacroParams
}

export interface PrinterStateKlipperConfig {
    [key: string]: unknown
}

export interface PrinterConfigMcuTempSensor {
    sensor_type?: string
    sensor_mcu?: string
    [key: string]: unknown
}

export interface PrinterTempSensorObject {
    temperature?: number
    measured_min_temp?: number
    measured_max_temp?: number
    [key: string]: unknown
}

export interface McuTempSensorEntry {
    key: string
    settings: PrinterConfigMcuTempSensor
    object: PrinterTempSensorObject
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

export type PrinterConfigNumberLike = number | string

export interface ExtruderConfigSettings {
    pressure_advance: PrinterConfigNumberLike
    pressure_advance_smooth_time: PrinterConfigNumberLike
    step_pin: string
    dir_pin: string
    rotation_distance: PrinterConfigNumberLike
    microsteps: PrinterConfigNumberLike
    full_steps_per_rotation: PrinterConfigNumberLike
    gear_ratio: string | number[][]
    enable_pin: string
    sensor_type: string
    pullup_resistor: PrinterConfigNumberLike
    sensor_pin: string
    min_temp: PrinterConfigNumberLike
    max_temp: PrinterConfigNumberLike
    min_extrude_temp: PrinterConfigNumberLike
    max_power: PrinterConfigNumberLike
    smooth_time: PrinterConfigNumberLike
    control: string
    pid_kp: PrinterConfigNumberLike
    pid_ki: PrinterConfigNumberLike
    pid_kd: PrinterConfigNumberLike
    heater_pin: string
    pwm_cycle_time: PrinterConfigNumberLike
    nozzle_diameter: PrinterConfigNumberLike
    filament_diameter: PrinterConfigNumberLike
    max_extrude_cross_section: PrinterConfigNumberLike
    max_extrude_only_velocity: PrinterConfigNumberLike
    max_extrude_only_accel: PrinterConfigNumberLike
    max_extrude_only_distance: PrinterConfigNumberLike
    instantaneous_corner_velocity: PrinterConfigNumberLike
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

export interface PrinterGetterObject {
    name: string
    type: string
    state: {
        [key: string]: unknown
    }
    config: {
        [key: string]: string
    }
    settings: {
        [key: string]: unknown
    }
}
