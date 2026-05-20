import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import {
    GuiMiscellaneousState,
    GuiMiscellaneousStateEntry,
    GuiMiscellaneousStateEntryLightgroup,
    GuiMiscellaneousStateEntryPreset,
} from '@/store/gui/miscellaneous/types'

const LOG_PREFIX = '[GUI][Miscellaneous]'
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

export const actions: ActionTree<GuiMiscellaneousState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async saveSetting(
        { dispatch },
        payload: { id: string; value: Partial<GuiMiscellaneousStateEntry> }
    ): Promise<void> {
        const key = `miscellaneous.entries.${payload.id}`
        await dispatch('gui/saveSetting', { name: key, value: payload.value }, { root: true })
    },

    async store({ dispatch }, value: Pick<GuiMiscellaneousStateEntry, 'type' | 'name'>): Promise<string> {
        const id = uuidv4()
        await dispatch('saveSetting', { id, value })

        return id
    },

    async update(
        { dispatch, state },
        payload: { id: string; value: Partial<GuiMiscellaneousStateEntry> }
    ): Promise<void> {
        const entry = state.entries[payload.id]
        if (!entry) {
            logError(`Failed to update entry with id ${payload.id}. Entry does not exist`)
            return
        }
        const value = { ...entry, ...payload.value }

        await dispatch('saveSetting', { id: payload.id, value })
    },

    async storeLightgroup(
        { dispatch, getters, state },
        payload: { type: string; name: string; lightgroup: GuiMiscellaneousStateEntryLightgroup }
    ): Promise<void> {
        let entryId = getters.getEntryKey(payload.type, payload.name)
        if (!entryId) entryId = await dispatch('store', { type: payload.type, name: payload.name })

        const entry = { ...state.entries[entryId] }
        const lightgroups = { ...(entry.lightgroups ?? {}) }
        const lightgroupId = uuidv4()
        lightgroups[lightgroupId] = { ...payload.lightgroup }

        await dispatch('update', { id: entryId, value: { lightgroups } })
    },

    async updateLightgroup(
        { dispatch, getters, state },
        payload: { type: string; name: string; lightgroupId: string; lightgroup: GuiMiscellaneousStateEntryLightgroup }
    ): Promise<void> {
        const entryId = getters.getEntryKey(payload.type, payload.name)
        if (!entryId) {
            logError(
                `Failed to update lightgroup with id ${payload.lightgroupId}. ` +
                    `Entry does not exist for type ${payload.type} and name ${payload.name}`
            )
            return
        }

        const entry = { ...state.entries[entryId] }
        const lightgroups = { ...(entry.lightgroups ?? {}) }
        lightgroups[payload.lightgroupId] = { ...payload.lightgroup }

        await dispatch('update', { id: entryId, value: { lightgroups } })
    },

    async deleteLightgroup(
        { commit, dispatch, getters },
        payload: { type: string; name: string; lightgroupId: string }
    ) {
        const entryId = getters.getEntryKey(payload.type, payload.name)
        if (!entryId) {
            logError(
                `Failed to delete lightgroup with id ${payload.lightgroupId}. ` +
                    `Entry does not exist for type ${payload.type} and name ${payload.name}`
            )
            return
        }

        const key = `miscellaneous.entries.${entryId}.lightgroups.${payload.lightgroupId}`
        await dispatch('gui/deleteSetting', key, { root: true })
        commit('destroyLightgroup', { id: entryId, lightgroupId: payload.lightgroupId })
    },

    async storePreset(
        { dispatch, getters, state },
        payload: { type: string; name: string; preset: GuiMiscellaneousStateEntryPreset }
    ): Promise<void> {
        let entryId = getters.getEntryKey(payload.type, payload.name)
        if (!entryId) entryId = await dispatch('store', { type: payload.type, name: payload.name })

        const entry = { ...state.entries[entryId] }
        const presets = { ...(entry.presets ?? {}) }
        const presetId = uuidv4()
        presets[presetId] = { ...payload.preset }

        await dispatch('update', { id: entryId, value: { presets } })
    },

    async updatePreset(
        { dispatch, getters, state },
        payload: { type: string; name: string; presetId: string; preset: GuiMiscellaneousStateEntryPreset }
    ): Promise<void> {
        const entryId = getters.getEntryKey(payload.type, payload.name)
        if (!entryId) {
            logError(
                `Failed to update preset with id ${payload.presetId}. ` +
                    `Entry does not exist for type ${payload.type} and name ${payload.name}`
            )
            return
        }

        const entry = { ...state.entries[entryId] }
        const presets = { ...(entry.presets ?? {}) }
        presets[payload.presetId] = { ...payload.preset }

        await dispatch('update', { id: entryId, value: { presets } })
    },

    async deletePreset({ commit, dispatch, getters }, payload: { type: string; name: string; presetId: string }) {
        const entryId = getters.getEntryKey(payload.type, payload.name)
        if (!entryId) {
            logError(
                `Failed to delete preset with id ${payload.presetId}. ` +
                    `Entry does not exist for type ${payload.type} and name ${payload.name}`
            )
            return
        }

        const key = `miscellaneous.entries.${entryId}.presets.${payload.presetId}`
        await dispatch('gui/deleteSetting', key, { root: true })
        commit('destroyPreset', { id: entryId, presetId: payload.presetId })
    },
}
