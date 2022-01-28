import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerJobQueueState, ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import Vue from 'vue'

export const mutations: MutationTree<ServerJobQueueState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setQueuedJobs(state, payload: ServerJobQueueStateJob[]) {
        Vue.set(state, 'queued_jobs', payload)
    },

    setQueueState(state, payload: string) {
        Vue.set(state, 'queue_state', payload)
    },
}
