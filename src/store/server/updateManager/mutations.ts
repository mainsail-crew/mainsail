import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { getSocket, $toast } from '@/store/runtime'
import { ServerUpdateManagerState } from '@/store/server/updateManager/types'

export const mutations: MutationTree<ServerUpdateManagerState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    resetRepos(state) {
        state.git_repos = []
        state.web_repos = []
        state.system = {
            package_count: 0,
            package_list: [],
        }
    },

    storeGitRepo(state, payload) {
        const newGitRepos = [...state.git_repos]
        newGitRepos.push({ ...payload })

        state.git_repos = newGitRepos
    },

    storeWebRepo(state, payload) {
        const newWebRepos = [...state.web_repos]
        newWebRepos.push({ ...payload })

        state.web_repos = newWebRepos
    },

    updateSystem(state, payload) {
        const newSystem = { ...state.system }
        newSystem.package_count = payload.package_count
        newSystem.package_list = payload.package_list

        state.system = newSystem
    },

    addUpdateResponse(state, payload) {
        if (state.updateResponse.application !== payload.application)
            state.updateResponse.application = payload.application

        if (state.updateResponse.complete !== payload.complete)
            state.updateResponse.complete = payload.complete

        if ('complete' in payload && payload.complete)
            getSocket().emit(
                'machine.update.status',
                { refresh: false },
                { action: 'server/updateManager/onUpdateStatus' }
            )

        state.updateResponse.messages.push({
            date: new Date(),
            message: payload.message,
        })
    },

    resetUpdateResponse(state) {
        state.updateResponse = {
            application: '',
            complete: true,
            messages: [],
        }
    },
}
