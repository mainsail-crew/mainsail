import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { FarmPrinterState } from '@/store/farm/printer/types'
import { setDataDeep } from '@/plugins/helpers'

export const mutations: MutationTree<FarmPrinterState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    resetData(state) {
        Object.assign(state.data, getDefaultState().data)
    },

    setSocketData(state, payload) {
        if ('status' in payload) payload = payload.status
        if ('requestParams' in payload) delete payload.requestParams
        if ('_namespace' in payload) {
            Vue.set(state, '_namespace', payload._namespace)
            delete payload._namespace
        }

        Object.entries(payload).forEach(([key, value]) => {
            Vue.set(state.socket, key, value)
        })
    },

    setData(state, payload) {
        if ('requestParams' in payload) delete payload.requestParams

        Object.entries(payload).forEach(([key, value]) => {
            if (typeof value === 'object') {
                Vue.set(state.data, key, {
                    ...state.data[key],
                    ...value,
                })
            } else Vue.set(state.data, key, value)
        })
    },

    setSettings(state, payload) {
        Vue.set(state, 'settings', {
            ...state.settings,
            ...payload,
        })
    },

    addWsData(state, payload) {
        const wsData = [...state.socket.wsData]
        wsData.push(payload)

        Vue.set(state.socket, 'wsData', wsData)
    },

    removeWsData(state, index) {
        const wsData = [...state.socket.wsData]
        wsData.splice(index, 1)

        Vue.set(state.socket, 'wsData', wsData)
    },

    setKlippyConnected(state, payload) {
        Vue.set(state.server, 'klippy_connected', payload)
    },

    setCurrentFile(state, payload) {
        if ('requestParams' in payload) delete payload.requestParams
        Vue.set(state, 'current_file', payload)
    },

    setConfigDir(state, payload) {
        // eslint-disable-next-line
        Object.values(payload).forEach((file: any) => {
            if (file.path?.startsWith('.theme/')) {
                state.theme_files.push(file.path)
            }
        })
    },

    setDatabases(state, payload) {
        Vue.set(state, 'databases', payload)
    },

    setMainsailData(state, payload) {
        setDataDeep(state.data.gui, payload)
    },

    setWebcamsData(state, payload) {
        Vue.set(state.data, 'webcams', payload)
    },
}
