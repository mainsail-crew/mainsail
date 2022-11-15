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

    async store({ commit, dispatch }, payload: payloadStore) {
        const id = uuidv4()

        await commit('store', { id, values: payload })
        await dispatch('upload', id)

        return id
    },

    async storeLightgroup({ commit, dispatch, getters }, payload: payloadStoreLightgroup) {
        let entryId = getters['getId'](payload.entry)
        if (entryId === null) entryId = await dispatch('store', payload.entry)

        const lightgroupId = uuidv4()
        await commit('updateLightgroup', { entryId, lightgroupId, values: payload.lightgroup })

        await dispatch('upload', entryId)

        return lightgroupId
    },

    async updateLightgroup({ commit, dispatch, getters }, payload: payloadStoreLightgroup) {
        const entryId = getters['getId'](payload.entry)
        if (entryId === null) return

        await commit('updateLightgroup', { entryId, lightgroupId: payload.lightgroup.id, values: payload.lightgroup })

        await dispatch('upload', entryId)

        return payload.lightgroup.id
    },

    async deleteLightgroup({ commit, dispatch, getters }, payload: payloadDeleteLightgroup) {
        const entryId = getters['getId'](payload.entry)
        if (entryId === null) return

        await commit('destroyLightgroup', { entryId, lightgroupId: payload.lightgroupId })

        await dispatch('upload', entryId)
    },

    async storePreset({ commit, dispatch, getters }, payload: payloadStorePreset) {
        let entryId = getters['getId'](payload.entry)
        if (entryId === null) entryId = await dispatch('store', payload.entry)

        const presetId = uuidv4()
        await commit('updatePreset', { entryId, presetId, values: payload.preset })

        await dispatch('upload', entryId)

        return presetId
    },

    async updatePreset({ commit, dispatch, getters }, payload: payloadStorePreset) {
        const entryId = getters['getId'](payload.entry)
        if (entryId === null) return

        await commit('updatePreset', { entryId, presetId: payload.preset.id, values: payload.preset })

        await dispatch('upload', entryId)

        return payload.preset.id
    },

    async deletePreset({ commit, dispatch, getters }, payload: payloadDeletePreset) {
        const entryId = getters['getId'](payload.entry)
        if (entryId === null) return

        await commit('destroyPreset', { entryId, presetId: payload.presetId })

        await dispatch('upload', entryId)
    },
}

interface payloadStore {
    type: string
    name: string
}

interface payloadStoreLightgroup {
    entry: {
        type: string
        name: string
    }
    lightgroup: GuiMiscellaneousStateEntryLightgroup
}

interface payloadDeleteLightgroup {
    entry: {
        type: string
        name: string
    }
    lightgroupId: string
}

interface payloadStorePreset {
    entry: {
        type: string
        name: string
    }
    preset: GuiMiscellaneousStateEntryPreset
}

interface payloadDeletePreset {
    entry: {
        type: string
        name: string
    }
    presetId: string
}
