import { FarmPrinterState } from '@/store/farm/printer/types'

export interface FarmState {
    [key: string]: FarmPrinterState
}
