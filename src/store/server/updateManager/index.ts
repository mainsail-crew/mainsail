import { Module } from 'vuex'
import { ServerUpdateManagerState } from '@/store/server/updateManager/types'
import { actions } from '@/store/server/updateManager/actions'
import { mutations } from '@/store/server/updateManager/mutations'
import { getters } from '@/store/server/updateManager/getters'

export const getDefaultState = (): ServerUpdateManagerState => {
    return {
        version_info: {},
        updateResponse: {
            application: '',
            complete: true,
            messages: [],
        },
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const updateManager: Module<ServerUpdateManagerState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
