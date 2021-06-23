import {PrinterTempHistoryState} from "@/store/printer/tempHistory/types";

export interface VTextareaType extends HTMLInputElement {
    $refs: {
        input: HTMLTextAreaElement
    }
}

export interface CommandHelp {
    command: string,
    commandLow: string,
    description?: string | Record<string, unknown>
}

export interface ConsoleCommandHelp {
    command: CommandHelp | null,
    original: string
}

export interface PrinterState {
    [key: string]: any
    helplist?: CommandHelp[]
    tempHistory?: PrinterTempHistoryState
}

export interface PrinterStateHeater {
    name: string
    type: string
    icon: string
    iconColor: string
    target: number
    temperature: number
    additionSensors: PrinterStateAdditionSensor[]
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
    additionSensors: PrinterStateAdditionSensor[]
    speed: number
    avgSpeed: number
    rpm: number | boolean
    presets: number[]
    chartColor: string
    chartSeries: string[]
    min_temp: number
    max_temp: number
}

export interface PrinterStateSensor {
    name: string
    temperature: number
    additionSensors: PrinterStateAdditionSensor[]
    icon: string
    min_temp: number
    max_temp: number
    measured_min_temp: number
    measured_max_temp: number
    chartColor: string
    chartSeries: string[]
}

export interface PrinterStateAdditionSensor {
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
    object: any,
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
    name: string
    data: any
    points: number[]
    min: number
    max: number
    variance: number
    is_active: boolean
}

export interface PrinterStateMacro {
    name: string
    prop: {
        [key: string]: any
    }
}

export interface PrinterStateKlipperConfig {
    [key: string]: any
}
