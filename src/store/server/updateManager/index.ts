import { Module } from 'vuex'
import { ServerUpdateMangerState } from '@/store/server/updateManager/types'
import { actions } from '@/store/server/updateManager/actions'
import { mutations } from '@/store/server/updateManager/mutations'
import { getters } from '@/store/server/updateManager/getters'

export const getDefaultState = (): ServerUpdateMangerState => {
    return {
        version_info: {},
        updateResponse: {
            application: '',
            complete: true,
            messages: [],
        }
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const updateManager: Module<ServerUpdateMangerState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}