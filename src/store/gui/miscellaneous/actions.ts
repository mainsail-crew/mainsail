import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import {
    GuiMiscellaneousState,
    GuiMiscellaneousStateEntryLightgroup,
    GuiMiscellaneousStateEntryPreset,
} from '@/store/gui/miscellaneous/types'

export const actions: ActionTree<GuiMiscellaneousState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    upload({ state }, id) {
        Vue.$socket.emit('server.database.post_item', {
            namespace: 'mainsail',
            key: 'miscellaneous.entries.' + id,
            value: state.entries[id],
        })
    },

    store({ commit, dispatch }, payload: payloadStore) {
        const id = uuidv4()

        commit('store', { id, values: payload })
        dispatch('upload', id)

        return id
    },

    storeLightgroup(
        { commit, dispatch, state },
        payload: { type: string; name: string; lightgroup: { name: string; start: number; end: number } }
    ) {
        let entryId =
            Object.keys(state.entries).find(
                (key) => state.entries[key].type === payload.type && state.entries[key].name === payload.name
            ) ?? null

        if (entryId === null) {
            entryId = uuidv4()
            commit('store', { id: entryId, values: { name: payload.name, type: payload.type } })
        }

        commit('storeLightgroup', { entryId, values: payload.lightgroup })
        dispatch('upload', entryId)
    },

    updateLightgroup(
        { commit, dispatch, state },
        payload: { type: string; name: string; lightgroupId: string; lightgroup: GuiMiscellaneousStateEntryLightgroup }
    ) {
        const entryId =
            Object.keys(state.entries).find(
                (key) => state.entries[key].type === payload.type && state.entries[key].name === payload.name
            ) ?? null
        if (entryId === null) return

        commit('updateLightgroup', { entryId, lightgroupId: payload.lightgroupId, values: payload.lightgroup })
        dispatch('upload', entryId)
    },

    deleteLightgroup({ commit, dispatch, state }, payload: { type: string; name: string; lightgroupId: string }) {
        const entryId =
            Object.keys(state.entries).find(
                (key) => state.entries[key].type === payload.type && state.entries[key].name === payload.name
            ) ?? null
        if (entryId === null) return

        commit('destroyLightgroup', { entryId, lightgroupId: payload.lightgroupId })
        dispatch('upload', entryId)
    },

    storePreset(
        { commit, dispatch, state },
        payload: {
            type: string
            name: string
            preset: {
                name: string
                red: number | null
                green: number | null
                blue: number | null
                white: number | null
            }
        }
    ) {
        let entryId =
            Object.keys(state.entries).find(
                (key) => state.entries[key].type === payload.type && state.entries[key].name === payload.name
            ) ?? null

        if (entryId === null) {
            entryId = uuidv4()
            commit('store', { id: entryId, values: { name: payload.name, type: payload.type } })
        }

        commit('storePreset', { entryId, values: payload.preset })
        dispatch('upload', entryId)
    },

    updatePreset(
        { commit, dispatch, state },
        payload: { type: string; name: string; presetId: string; preset: GuiMiscellaneousStateEntryPreset }
    ) {
        const entryId =
            Object.keys(state.entries).find(
                (key) => state.entries[key].type === payload.type && state.entries[key].name === payload.name
            ) ?? null
        if (entryId === null) return

        commit('updatePreset', { entryId, presetId: payload.presetId, values: payload.preset })
        dispatch('upload', entryId)
    },

    deletePreset({ commit, dispatch, state }, payload: { type: string; name: string; presetId: string }) {
        const entryId =
            Object.keys(state.entries).find(
                (key) => state.entries[key].type === payload.type && state.entries[key].name === payload.name
            ) ?? null
        if (entryId === null) return

        commit('destroyPreset', { entryId, presetId: payload.presetId })
        dispatch('upload', entryId)
    },
}

interface payloadStore {
    type: string
    name: string
}
