import Vue from 'vue'
import { ActionTree } from 'vuex'
import i18n from '@/plugins/i18n'
import { RootState } from '@/store/types'
import { MoonrakerAgentEvent } from '@/store/server/types'
import { AldisUpdateArguments, FirmwareRunState, ServerFirmwareState } from '@/store/server/firmware/types'
import {
    AGENT_NAME,
    SUPPORTED_API_VERSION,
    agentErrorMessage,
    apiVersionOf,
    applyEvent,
    isStatusResponse,
    isUpdateResponse,
    isUpdateResult,
    needsRetry,
    reconcileRun,
    unsupportedStatus,
} from '@/store/server/firmware/helpers'

const runStateOf = (state: ServerFirmwareState): FirmwareRunState => ({
    busy: state.busy,
    runId: state.runId,
    responses: state.responses,
    lastResult: state.lastResult,
    lastMessage: state.lastMessage,
})

const request = (method: string, args: unknown) =>
    Vue.$socket.emitAndWait('server.extensions.request', { agent: AGENT_NAME, method, arguments: args })

const errorText = (error: unknown) => agentErrorMessage(error, i18n.t('Machine.FirmwarePanel.RequestFailed').toString())

export const actions: ActionTree<ServerFirmwareState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    async init({ state, commit, dispatch }) {
        if (state.initialised) return

        commit('setInitialised', true)
        await dispatch('refresh')
    },

    async refresh({ state, commit, dispatch }) {
        if (state.refreshing) {
            commit('setRefreshQueued', true)
            return
        }

        commit('setStatusError', null)
        commit('setRefreshing', true)

        try {
            const result = await request('status', null)
            commit('setRefreshing', false)
            await dispatch('onStatus', result)
        } catch (error: unknown) {
            commit('setRefreshing', false)
            commit('setStatusError', errorText(error))
        }

        if (state.refreshQueued) {
            commit('setRefreshQueued', false)
            await dispatch('refresh')
        }
    },

    async onStatus({ state, commit, dispatch }, payload: unknown) {
        const apiVersion = apiVersionOf(payload)
        if (apiVersion !== null && apiVersion !== SUPPORTED_API_VERSION) {
            commit('setStatus', unsupportedStatus(apiVersion))
            commit('setStatusError', null)
            return
        }

        if (!isStatusResponse(payload)) {
            commit('setStatusError', i18n.t('Machine.FirmwarePanel.MalformedStatus').toString())
            return
        }

        commit('setStatus', payload)
        commit('setStatusError', null)
        commit('setRunState', reconcileRun(runStateOf(state), payload.run ?? null))

        if (payload.run?.state === 'finished') {
            commit('setRetried', false)
        } else if (!state.retried && needsRetry(runStateOf(state), payload.run ?? null)) {
            commit('setRetried', true)
            await dispatch('refresh')
        }
    },

    async update({ state, commit, dispatch }, args: AldisUpdateArguments) {
        if (state.busy) return

        commit('setUpdateStarted')

        let result: unknown
        try {
            result = await request('update', args)
        } catch (error: unknown) {
            commit('setBusy', false)
            Vue.$toast.error(errorText(error))
            await dispatch('refresh')
            return
        }

        if (isUpdateResult(result)) {
            commit('setRunId', result.run_id)
            return
        }

        window.console.debug('aldis: unexpected update reply', result)
        commit('setBusy', false)
        Vue.$toast.error(i18n.t('Machine.FirmwarePanel.MalformedStatus').toString())
        await dispatch('refresh')
    },

    async onAgentEvent({ state, commit, dispatch }, envelope: MoonrakerAgentEvent) {
        if (envelope.event !== 'update_response' || !isUpdateResponse(envelope.data)) return

        commit('setRunState', applyEvent(runStateOf(state), envelope.data))

        if (envelope.data.complete) await dispatch('refresh')
    },

    async onKlippyStateChanged({ state, dispatch }) {
        if (state.initialised) await dispatch('refresh')
    },

    onAgentDisconnected({ state, commit }) {
        commit('setInitialised', false)
        commit('setRefreshing', false)

        if (!state.busy) return

        const message = i18n.t('App.FirmwareDialog.LostRun').toString()
        const current = runStateOf(state)
        commit('setRunState', {
            ...current,
            busy: false,
            responses: [
                ...current.responses,
                { id: current.responses.length, date: new Date(), message, mcu: null, phase: 'done' },
            ],
            lastMessage: message,
        })
    },
}
