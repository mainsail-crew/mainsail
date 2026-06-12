import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import type { ServerJobQueueState, ServerJobQueueStateJob } from '@/store/server/jobQueue/types'

export const mutations: MutationTree<ServerJobQueueState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setQueuedJobs(state, payload: ServerJobQueueStateJob[]) {
        state.queued_jobs = payload
    },

    setQueueState(state, payload: string) {
        state.queue_state = payload
    },
}
