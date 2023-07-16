import { FarmPrinterState } from '@/store/farm/printer/types'
import { getDefaultState as getGuiDefaultState } from '@/store/gui/index'
import { actions } from '@/store/farm/printer/actions'
import { mutations } from '@/store/farm/printer/mutations'
import { getters } from '@/store/farm/printer/getters'
import { Module } from 'vuex'

export const getDefaultState = (): FarmPrinterState => {
    return {
        _namespace: '',
        socket: {
            instance: null,
            hostname: '',
            port: 7125,
            webPort: 80,
            protocol: document.location.protocol === 'https:' ? 'wss' : 'ws',
            isConnected: false,
            isConnecting: false,
            reconnects: 0,
            maxReconnects: 2,
            reconnectInterval: 1000,
            wsData: [],
        },
        server: {
            klippy_connected: false,
        },
        data: {
            gui: getGuiDefaultState(),
            webcams: [],
        },
        settings: {},
        databases: [],
        current_file: {
            isDirectory: false,
            filename: '',
            modified: new Date(),
            permissions: '',
        },
        theme_files: [],
    }
}

// initial state
const state = (): FarmPrinterState => {
    return getDefaultState()
}

// eslint-disable-next-line
export const printer: Module<FarmPrinterState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
