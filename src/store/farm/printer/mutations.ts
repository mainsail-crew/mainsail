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
import Vue from 'vue'

export const mutations: MutationTree<FarmPrinterState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    setId(state, id: string): void {
        Vue.set(state, 'id', id)
    },

    setSocket(state, payload: Partial<FarmPrinterStateSocket>): void {
        Object.entries(payload).forEach(([key, value]) => Vue.set(state.socket, key, value))
    },

    setKlippyState(state, klippyState: FarmPrinterKlippyState): void {
        Vue.set(state, 'klippyState', klippyState)
    },

    resetData(state): void {
        Vue.set(state, 'data', {})
        Vue.set(state, 'currentFile', null)
    },

    /** Merges a (partial) status update into the subscribed objects. */
    setData(state, payload: FarmPrinterStateData): void {
        setDataDeep(state.data, payload)
    },

    setCurrentFile(state, file: FarmPrinterStateCurrentFile | null): void {
        Vue.set(state, 'currentFile', file)
    },

    setThemeFiles(state, files: string[]): void {
        Vue.set(state, 'themeFiles', files)
    },

    setMainsail(state, mainsail: FarmPrinterStateMainsail): void {
        Vue.set(state, 'mainsail', mainsail)
    },

    setWebcams(state, webcams: GuiWebcamStateWebcam[]): void {
        Vue.set(state, 'webcams', webcams)
    },

    setSettings(state, settings: FarmPrinterSettings): void {
        Vue.set(state, 'settings', { ...state.settings, ...settings })
    },
}
