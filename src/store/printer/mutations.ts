import Vue from 'vue'
import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import {PrinterState} from '@/store/printer/types'

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
        // eslint-disable-next-line
		const setDataDeep = (currentState: any, payload: any) => {
            if (payload !== null && typeof payload === 'object') {
                Object.keys(payload).forEach((key: string) => {
                    const value = payload[key]

                    if (
                        typeof value === 'object' &&
						!Array.isArray(value) &&
						key in currentState &&
						value !== null &&
						currentState[key] !== null
                    ) {
                        setDataDeep(currentState[key], value)
                    } else if (key === 'temperature') {
                        const newValue = Math.round(value * 10) / 10
                        if (currentState[key] !== newValue) Vue.set(currentState, key, newValue)
                    } else Vue.set(currentState, key, value)
                })
            }
        }

        setDataDeep(state, payload)
    },

    setHelplist(state, payload) {
        const helplist = []

        for (const [command, description] of Object.entries(payload)) {
            helplist.push({
                'commandLow': command.toLowerCase(),
                'command': command,
                'description': description,
            })
        }

        Vue.set(state, 'helplist', helplist)
    },

    clearCurrentFile(state) {
        Vue.set(state, 'current_file', {})
    },

    setEndstopStatus(state, payload) {
        delete payload.requestParams

        Vue.set(state, 'endstops', payload)
    },

    removeBedMeshProfile(state, payload) {
        if ('bed_mesh '+payload.name in state.configfile.config) {
            Object.assign(state.configfile.config['bed_mesh '+payload.name], { deleted: true })
        }
    }
}