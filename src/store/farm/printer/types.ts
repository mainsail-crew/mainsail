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
        // eslint-disable-next-line
        [key: string]: any
    }
    // eslint-disable-next-line
    settings: any
    databases: string[]
    current_file: FileStateFile
    theme_files: string[]
}

export interface FarmPrinterStateSocket {
    instance: WebSocket | null
    hostname: string
    port: number
    webPort: number
    protocol: string
    isConnected: boolean
    isConnecting: boolean
    reconnects: number
    maxReconnects: number
    reconnectInterval: number
    // eslint-disable-next-line
    wsData: any[]
}

export interface FarmPrinterStateServer {
    klippy_connected: boolean
}
