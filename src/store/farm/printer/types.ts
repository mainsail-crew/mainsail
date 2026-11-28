import type { GuiState } from '@/store/gui/types'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import type { RPCResult } from '@/types/moonraker'
import type { GcodeThumbnail } from '@/types/moonraker/FileManagerRPC'

export type FarmPrinterKlippyState = RPCResult<'server.info'>['klippy_state']

export interface FarmPrinterState {
    /** Printer id, equal to the module namespace in `farm/<id>` */
    id: string
    socket: FarmPrinterStateSocket
    klippyState: FarmPrinterKlippyState
    /** Subscribed Klipper objects */
    data: FarmPrinterStateData
    /** Metadata of the file in print_stats.filename */
    currentFile: FarmPrinterStateCurrentFile | null
    /** Files in the config/.theme directory */
    themeFiles: string[]
    /** Settings from the remote Mainsail database namespace */
    mainsail: FarmPrinterStateMainsail
    webcams: GuiWebcamStateWebcam[]
    /** Local settings for this printer, persisted in gui/remoteprinters */
    settings: FarmPrinterSettings
}

export interface FarmPrinterStateSocket {
    hostname: string
    port: number
    path: string
    protocol: 'ws' | 'wss'
    isConnected: boolean
    isConnecting: boolean
}

export type FarmPrinterConnectionState = Pick<FarmPrinterStateSocket, 'isConnected' | 'isConnecting'>

export interface FarmPrinterHeater {
    temperature?: number
    target?: number
    power?: number
}

export interface FarmPrinterStateData {
    webhooks?: {
        state?: string
        state_message?: string
    }
    print_stats?: {
        filename?: string
        state?: string
        message?: string
        print_duration?: number
        total_duration?: number
        filament_used?: number
    }
    virtual_sdcard?: {
        file_path?: string | null
        file_position?: number
        file_size?: number
        is_active?: boolean
        progress?: number
    }
    display_status?: {
        progress?: number
        message?: string | null
    }
    heater_bed?: FarmPrinterHeater
    'temperature_fan chamber'?: FarmPrinterHeater
    'temperature_sensor chamber'?: {
        temperature?: number
    }
    [extruder: `extruder${string}`]: FarmPrinterHeater | undefined
}

export interface FarmPrinterStateCurrentFile {
    filename: string
    thumbnails: GcodeThumbnail[]
    gcode_start_byte: number | null
    gcode_end_byte: number | null
    filament_total: number | null
    estimated_time: number | null
}

export interface FarmPrinterStateMainsail {
    printername: string
    logoColor: string
    calcPrintProgress: GuiState['general']['calcPrintProgress']
    calcEtaTime: GuiState['general']['calcEtaTime']
}

export interface FarmPrinterSettings {
    /** Name of the webcam shown in the farm panel, 'off' disables it */
    currentCamName?: string
}

export interface FarmPrinterTemperature {
    name: string
    temperature: number
    target: number | null
}
