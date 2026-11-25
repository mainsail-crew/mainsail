import { FarmPrinterState, FarmPrinterStateMainsail } from '@/store/farm/printer/types'
import { getDefaultState as getGuiDefaultState } from '@/store/gui/index'
import { actions } from '@/store/farm/printer/actions'
import { mutations } from '@/store/farm/printer/mutations'
import { getters } from '@/store/farm/printer/getters'
import { Module } from 'vuex'
import { RootState } from '@/store/types'

export const getDefaultMainsail = (): FarmPrinterStateMainsail => {
    const gui = getGuiDefaultState()

    return {
        printername: gui.general.printername,
        logoColor: gui.uiSettings.logo,
        calcPrintProgress: gui.general.calcPrintProgress,
        calcEtaTime: gui.general.calcEtaTime,
    }
}

export const getDefaultState = (): FarmPrinterState => {
    return {
        id: '',
        socket: {
            hostname: '',
            port: 7125,
            path: '',
            protocol: document.location.protocol === 'https:' ? 'wss' : 'ws',
            isConnected: false,
            isConnecting: false,
        },
        klippyState: 'disconnected',
        data: {},
        currentFile: null,
        themeFiles: [],
        mainsail: getDefaultMainsail(),
        webcams: [],
        settings: {},
    }
}

// initial state
const state = (): FarmPrinterState => {
    return getDefaultState()
}

export const printer: Module<FarmPrinterState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
