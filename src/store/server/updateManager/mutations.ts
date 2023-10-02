import { getDefaultState } from './index'
import Vue from 'vue'
import { MutationTree } from 'vuex'
import { ServerUpdateManagerState } from '@/store/server/updateManager/types'

export const mutations: MutationTree<ServerUpdateManagerState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    resetRepos(state) {
        Vue.set(state, 'git_repos', [])
        Vue.set(state, 'web_repos', [])
        Vue.set(state, 'system', {
            package_count: 0,
            package_list: [],
        })
    },

    storeGitRepo(state, payload) {
        const newGitRepos = [...state.git_repos]
        newGitRepos.push({ ...payload })

        Vue.set(state, 'git_repos', newGitRepos)
    },

    storeWebRepo(state, payload) {
        const newWebRepos = [...state.web_repos]
        newWebRepos.push({ ...payload })

        Vue.set(state, 'web_repos', newWebRepos)
    },

    updateSystem(state, payload) {
        const newSystem = { ...state.system }
        newSystem.package_count = payload.package_count
        newSystem.package_list = payload.package_list

        Vue.set(state, 'system', newSystem)
    },

    addUpdateResponse(state, payload) {
        if (state.updateResponse.application !== payload.application)
            Vue.set(state.updateResponse, 'application', payload.application)

        if (state.updateResponse.complete !== payload.complete)
            Vue.set(state.updateResponse, 'complete', payload.complete)

        if ('complete' in payload && payload.complete)
            Vue.$socket.emit(
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
        Vue.set(state, 'updateResponse', {
            application: '',
            complete: true,
            messages: [],
        })
    },
}
