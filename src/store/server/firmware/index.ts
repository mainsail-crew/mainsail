import { Module } from 'vuex'
import { ServerFirmwareState } from '@/store/server/firmware/types'
import { actions } from '@/store/server/firmware/actions'
import { mutations } from '@/store/server/firmware/mutations'
import { getters } from '@/store/server/firmware/getters'
import { RootState } from '@/store/types'

export const getDefaultState = (): ServerFirmwareState => {
    return {
        initialised: false,
        status: null,
        statusError: null,
        refreshing: false,
        refreshQueued: false,
        retried: false,
        busy: false,
        runId: null,
        responses: [],
        lastResult: null,
        lastMessage: null,
    }
}

const state = getDefaultState()

export const firmware: Module<ServerFirmwareState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
