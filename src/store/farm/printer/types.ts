import { GuiState } from '@/store/gui/types'
import { FileStateFile } from '@/store/files/types'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

export interface FarmPrinterState {
    _namespace: string
    socket: FarmPrinterStateSocket
    server: FarmPrinterStateServer
    data: {
        gui: GuiState
        webcams: GuiWebcamStateWebcam[]
        [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    settings: Record<string, unknown>
    databases: string[]
    current_file: FileStateFile
    theme_files: string[]
}

export interface FarmPrinterStateSocket {
    instance: WebSocket | null
    hostname: string
    port: number
    webPort: number
    path: string
    protocol: string
    isConnected: boolean
    isConnecting: boolean
    reconnects: number
    maxReconnects: number
    reconnectInterval: number
    wsData: FarmPrinterWsDataEntry[]
}

export interface FarmPrinterWsDataEntry {
    id: number
    action?: string
    params: Record<string, unknown>
    actionPreload?: Record<string, unknown> | null
}

export interface FarmPrinterStateServer {
    klippy_connected: boolean
}
