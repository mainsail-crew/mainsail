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
        // eslint-disable-next-line
        wsData: any[]
    },
    data: {
        gui: GuiState
        // eslint-disable-next-line
        [key: string]: any
    },
    // eslint-disable-next-line
    settings: any,
    databases: string[],
    current_file: FileStateFile,
    theme_files: string[]
}