import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerUpdateManagerState } from '@/store/server/updateManager/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<ServerUpdateManagerState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit('machine.update.status', {}, { action: 'server/updateManager/onUpdateStatus' })
    },

    async onUpdateStatus({ commit, dispatch }, payload) {
        await commit('resetRepos')

        for (const key of Object.keys(payload.version_info)) {
            const module = payload.version_info[key] ?? {}
            const configured_type = module.configured_type ?? null

            if (['git_repo', 'zip'].includes(configured_type)) {
                await commit('storeGitRepo', { ...module, name: key })
                continue
            }

            if (['web', 'web_beta'].includes(configured_type)) {
                await commit('storeWebRepo', { ...module, name: key })
                continue
            }

            if (key === 'system') {
                await commit('updateSystem', { ...module })
            }
        }

        await dispatch('socket/removeInitModule', 'server/updateManager/init', { root: true })
    },
}
