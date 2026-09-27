import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { AldisStatusResponse, FirmwareRunState, ServerFirmwareState } from '@/store/server/firmware/types'

export const mutations: MutationTree<ServerFirmwareState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setInitialised(state, payload: boolean) {
        Vue.set(state, 'initialised', payload)
    },

    setStatus(state, payload: AldisStatusResponse) {
        Vue.set(state, 'status', payload)
    },

    setStatusError(state, payload: string | null) {
        Vue.set(state, 'statusError', payload)
    },

    setRefreshing(state, payload: boolean) {
        Vue.set(state, 'refreshing', payload)
    },

    setRefreshQueued(state, payload: boolean) {
        Vue.set(state, 'refreshQueued', payload)
    },

    setRunState(state, payload: FirmwareRunState) {
        Vue.set(state, 'busy', payload.busy)
        Vue.set(state, 'runId', payload.runId)
        Vue.set(state, 'responses', payload.responses)
        Vue.set(state, 'lastResult', payload.lastResult)
        Vue.set(state, 'lastMessage', payload.lastMessage)
    },

    setBusy(state, payload: boolean) {
        Vue.set(state, 'busy', payload)
    },

    setRunId(state, payload: string) {
        if (state.runId === null) Vue.set(state, 'runId', payload)
    },

    setRetried(state, payload: boolean) {
        Vue.set(state, 'retried', payload)
    },

    setUpdateStarted(state) {
        Vue.set(state, 'busy', true)
        Vue.set(state, 'runId', null)
        Vue.set(state, 'responses', [])
        Vue.set(state, 'lastResult', null)
        Vue.set(state, 'lastMessage', null)
        Vue.set(state, 'retried', false)
    },

    clearResponses(state) {
        Vue.set(state, 'responses', [])
    },
}
