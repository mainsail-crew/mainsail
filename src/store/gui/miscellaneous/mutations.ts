import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import {
    GuiMiscellaneousState,
    GuiMiscellaneousStateEntry,
    GuiMiscellaneousStateEntryLightgroup,
    GuiMiscellaneousStateEntryPreset,
} from '@/store/gui/miscellaneous/types'

export const mutations: MutationTree<GuiMiscellaneousState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    store(state, payload: payloadStore) {
        const values: GuiMiscellaneousStateEntry = {
            name: payload.values.name,
            type: payload.values.type,
            lightgroups: {},
            presets: {},
        }

        Vue.set(state.entries, payload.id, values)
    },

    updateLightgroup(state, payload: payloadUpdateLightgroup) {
        const lightgroup: GuiMiscellaneousStateEntryLightgroup = {
            name: payload.values.name,
            start: parseInt(payload.values.start.toString()),
            end: parseInt(payload.values.end.toString()),
        }

        Vue.set(state.entries[payload.entryId].lightgroups, payload.lightgroupId, lightgroup)
    },

    destroyLightgroup(state, payload: payloadDestroyLightgroup) {
        const entries = { ...state.entries }
        delete entries[payload.entryId].lightgroups[payload.lightgroupId]

        Vue.set(state, 'entries', entries)
    },

    updatePreset(state, payload: payloadUpdatePreset) {
        const preset: GuiMiscellaneousStateEntryPreset = {
            name: payload.values.name,
            red: payload.values.red,
            green: payload.values.green,
            blue: payload.values.blue,
            white: payload.values.white,
        }

        Vue.set(state.entries[payload.entryId].presets, payload.presetId, preset)
    },

    destroyPreset(state, payload: payloadDestroyPreset) {
        const entries = { ...state.entries }
        delete entries[payload.entryId].presets[payload.presetId]

        Vue.set(state, 'entries', entries)
    },
}

interface payloadStore {
    id: string
    values: {
        type: string
        name: string
    }
}

interface payloadUpdateLightgroup {
    entryId: string
    lightgroupId: string
    values: GuiMiscellaneousStateEntryLightgroup
}

interface payloadDestroyLightgroup {
    entryId: string
    lightgroupId: string
}

interface payloadUpdatePreset {
    entryId: string
    presetId: string
    values: GuiMiscellaneousStateEntryPreset
}

interface payloadDestroyPreset {
    entryId: string
    presetId: string
}
