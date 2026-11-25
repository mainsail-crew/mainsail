import { FarmPrinterSettings, FarmPrinterState } from '@/store/farm/printer/types'

export interface FarmState {
    [id: string]: FarmPrinterState
}

export interface FarmPrinterAddress {
    hostname: string
    port: number
    path: string
}

export interface FarmRegisterPrinterPayload extends FarmPrinterAddress {
    id: string
    settings?: FarmPrinterSettings
}

export interface FarmUpdatePrinterPayload extends FarmPrinterAddress {
    id: string
}
