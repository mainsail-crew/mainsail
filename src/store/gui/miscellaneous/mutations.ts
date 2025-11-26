import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import {
    GuiMiscellaneousState,
    GuiMiscellaneousStateEntry,
    GuiMiscellaneousStateEntryLightgroup,
    GuiMiscellaneousStateEntryPreset,
} from '@/store/gui/miscellaneous/types'
import { v4 as uuidv4 } from 'uuid'

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

    storeLightgroup(state, payload: payloadCreateLightgroup) {
        const lightgroupId = uuidv4()

        Vue.set(state.entries[payload.entryId].lightgroups, lightgroupId, payload.values)
    },

    updateLightgroup(state, payload: payloadUpdateLightgroup) {
        Vue.set(state.entries[payload.entryId].lightgroups, payload.lightgroupId, payload.values)
    },

    destroyLightgroup(state, payload: payloadDestroyLightgroup) {
        const entry = { ...state.entries[payload.entryId] }
        delete entry.lightgroups[payload.lightgroupId]

        Vue.set(state.entries, payload.entryId, entry)
    },

    storePreset(state, payload: payloadCreatePreset) {
        const presetId = uuidv4()

        Vue.set(state.entries[payload.entryId].presets, presetId, payload.values)
    },

    updatePreset(state, payload: payloadUpdatePreset) {
        Vue.set(state.entries[payload.entryId].presets, payload.presetId, payload.values)
    },

    destroyPreset(state, payload: payloadDestroyPreset) {
        const entry = { ...state.entries[payload.entryId] }
        delete entry.presets[payload.presetId]

        Vue.set(state.entries, payload.entryId, entry)
    },
}

interface payloadStore {
    id: string
    values: {
        type: string
        name: string
    }
}

interface payloadCreateLightgroup {
    entryId: string
    values: GuiMiscellaneousStateEntryLightgroup
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

interface payloadCreatePreset {
    entryId: string
    values: GuiMiscellaneousStateEntryPreset
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
