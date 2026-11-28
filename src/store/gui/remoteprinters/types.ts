import { FarmPrinterConnectionState, FarmPrinterSettings } from '@/store/farm/printer/types'

export interface GuiRemoteprintersState {
    printers: Record<string, GuiRemoteprintersStatePrinter>
}

export interface GuiRemoteprintersStatePrinter {
    id?: string | null
    hostname: string
    port: number
    path?: string | null
    name?: string | null
    socket?: FarmPrinterConnectionState
    settings?: FarmPrinterSettings
}
