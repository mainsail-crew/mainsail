import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import {
    GuiMiscellaneousState,
    GuiMiscellaneousStateEntry,
    GuiMiscellaneousStateEntryLightgroup,
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
        const entry = state.entries[payload.entryId]
        delete entry.lightgroups[payload.lightgroupId]

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

interface payloadUpdateLightgroup {
    entryId: string
    lightgroupId: string
    values: GuiMiscellaneousStateEntryLightgroup
}

interface payloadDestroyLightgroup {
    entryId: string
    lightgroupId: string
}
