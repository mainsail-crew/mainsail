import {FarmPrinterStateSocket} from '@/store/farm/printer/types'

export interface GuiRemoteprintersState {
    remoteprinters: {
        [key: string]: GuiRemoteprintersStatePrinter
    }
}

export interface GuiRemoteprintersStatePrinter {
    id?: string | null
    hostname: string
    port: number
    socket?: FarmPrinterStateSocket
    settings?: {
        [key: string]: any
    }
}