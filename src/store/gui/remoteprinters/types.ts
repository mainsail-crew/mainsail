import { FarmPrinterStateSocket } from '@/store/farm/printer/types'

export interface GuiRemoteprintersState {
    printers: Record<string, GuiRemoteprintersStatePrinter>
}

export interface GuiRemoteprintersStatePrinter {
    id?: string | null
    hostname: string
    port: number
    path?: string | null
    name?: string | null
    socket?: FarmPrinterStateSocket
    settings?: Record<string, unknown>
}
