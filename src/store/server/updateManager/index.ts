import { Module } from 'vuex'
import { ServerUpdateManagerState } from '@/store/server/updateManager/types'
import { actions } from '@/store/server/updateManager/actions'
import { mutations } from '@/store/server/updateManager/mutations'
import { getters } from '@/store/server/updateManager/getters'

export const getDefaultState = (): ServerUpdateManagerState => {
    return {
        busy: false,
        github_rate_limit: null,
        github_requests_remaining: null,
        github_limit_reset_time: null,
        git_repos: [],
        web_repos: [],
        system: {
            package_count: 0,
            package_list: [],
        },
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
