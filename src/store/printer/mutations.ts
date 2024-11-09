import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { PrinterState } from '@/store/printer/types'

export const mutations: MutationTree<PrinterState> = {
    reset(state) {
        const defaultState = getDefaultState()

        for (const key of Object.keys(state)) {
            if (!(key in defaultState) && key !== 'tempHistory') {
                delete state[key]
            }
        }

        for (const [key, value] of Object.entries(defaultState)) {
            Vue.set(state, key, value)
        }
    },

    setData(state, payload) {
        Object.keys(payload).forEach((key) => {
            const value = payload[key]

            if (typeof value !== 'object' || value === null || !(key in state)) {
                Vue.set(state, key, value)
                return
            }

            if (typeof value === 'object') {
                Object.keys(value).forEach((subkey) => {
                    Vue.set(state[key], subkey, value[subkey])
                })
            }
        })
    },

    setBedMeshProfiles(state, payload) {
        if ('bed_mesh' in state) {
            Vue.set(state.bed_mesh, 'profiles', payload)
        }
    },

    clearCurrentFile(state) {
        Vue.set(state, 'current_file', {})
    },

    setEndstopStatus(state, payload) {
        delete payload.requestParams

        Vue.set(state, 'endstops', payload)
    },

    removeBedMeshProfile(state, payload) {
        if ('bed_mesh ' + payload.name in state.configfile.config) {
            Object.assign(state.configfile.config['bed_mesh ' + payload.name], { deleted: true })
        }
    },

    clearScrewsTiltAdjust(state) {
        Vue.set(state.screws_tilt_adjust, 'error', false)
        Vue.set(state.screws_tilt_adjust, 'results', {})
    },
}
