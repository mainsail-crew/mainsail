import { GetterTree } from 'vuex'
import { RootState } from '@/store/types'
import {
    AldisBlocker,
    AldisHost,
    AldisMcu,
    FirmwareResponseLine,
    ServerFirmwareState,
} from '@/store/server/firmware/types'
import { AGENT_NAME, SUPPORTED_API_VERSION, updatableMcus } from '@/store/server/firmware/helpers'

export const getters: GetterTree<ServerFirmwareState, RootState> = {
    isSupported: (state, getters, rootState, rootGetters): boolean => {
        return rootGetters['server/agentSupport'](AGENT_NAME)
    },

    isRegistered: (state, getters, rootState): boolean => {
        return rootState.server?.system_info?.available_services?.includes(AGENT_NAME) ?? false
    },

    isLoading: (state, getters): boolean => {
        return getters.isSupported && state.status === null && state.refreshing
    },

    isRefreshing: (state): boolean => {
        return state.refreshing
    },

    isApiSupported: (state): boolean => {
        return state.status === null || state.status.api_version === SUPPORTED_API_VERSION
    },

    getMcus: (state, getters): AldisMcu[] => {
        return getters.isApiSupported ? (state.status?.mcus ?? []) : []
    },

    getBlocker: (state): AldisBlocker | null => {
        return state.status?.blocker ?? null
    },

    getHost: (state, getters): AldisHost | null => {
        return getters.isApiSupported ? (state.status?.host ?? null) : null
    },

    getResponses: (state): FirmwareResponseLine[] => {
        return state.responses
    },

    getStatusError: (state): string | null => {
        return state.statusError
    },

    getUpdatableMcus: (state): string[] => {
        return updatableMcus(state.status)
    },

    hasUpdates: (state, getters): boolean => {
        return getters.isSupported && getters.getUpdatableMcus.length > 0
    },
}
