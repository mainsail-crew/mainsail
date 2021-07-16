import { GuiState } from "@/store/gui/types";
import { FileStateFile } from "@/store/files/types";

export interface FarmPrinterState {
    _namespace: string
    socket: {
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
        wsData: any[]
    },
    data: {
        gui: GuiState
        [key: string]: any
    },
    settings: any,
    databases: string[],
    current_file: FileStateFile,
    theme_files: string[]
}