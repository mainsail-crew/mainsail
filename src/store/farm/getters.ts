import { GetterTree } from 'vuex'
import { FarmState } from '@/store/farm/types'
import { FarmPrinterConnectionState, FarmPrinterState } from '@/store/farm/printer/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<FarmState, RootState> = {
    printers: (state): FarmPrinterState[] => Object.values(state),

    printerCount: (state): number => Object.keys(state).length,

    printerName:
        (_state, getters) =>
        (id: string): string =>
            getters[`${id}/printerName`],

    /** Connection state of a printer. Falls back to a disconnected state for unknown printers. */
    printerSocket:
        (state) =>
        (id: string): FarmPrinterConnectionState =>
            state[id]?.socket ?? { isConnected: false, isConnecting: false },
}
