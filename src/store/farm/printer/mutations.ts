import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import {
    FarmPrinterKlippyState,
    FarmPrinterSettings,
    FarmPrinterState,
    FarmPrinterStateCurrentFile,
    FarmPrinterStateData,
    FarmPrinterStateMainsail,
    FarmPrinterStateSocket,
} from '@/store/farm/printer/types'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { setDataDeep } from '@/plugins/helpers'

export const mutations: MutationTree<FarmPrinterState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    setId(state, id: string): void {
        state.id = id
    },

    setSocket(state, payload: Partial<FarmPrinterStateSocket>): void {
        Object.assign(state.socket, payload)
    },

    setKlippyState(state, klippyState: FarmPrinterKlippyState): void {
        state.klippyState = klippyState
    },

    resetData(state): void {
        state.data = {}
        state.currentFile = null
    },

    /** Merges a (partial) status update into the subscribed objects. */
    setData(state, payload: FarmPrinterStateData): void {
        setDataDeep(state.data, payload)
    },

    setCurrentFile(state, file: FarmPrinterStateCurrentFile | null): void {
        state.currentFile = file
    },

    setThemeFiles(state, files: string[]): void {
        state.themeFiles = files
    },

    setMainsail(state, mainsail: FarmPrinterStateMainsail): void {
        state.mainsail = mainsail
    },

    setWebcams(state, webcams: GuiWebcamStateWebcam[]): void {
        state.webcams = webcams
    },

    setSettings(state, settings: FarmPrinterSettings): void {
        state.settings = { ...state.settings, ...settings }
    },
}
