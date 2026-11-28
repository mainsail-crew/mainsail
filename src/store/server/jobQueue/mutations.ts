import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerJobQueueState } from '@/store/server/jobQueue/types'
import type { JobQueueStatus, QueueState } from '@/types/moonraker/JobQueueRPC'
import Vue from 'vue'

export const mutations: MutationTree<ServerJobQueueState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    setStatus(state, payload: JobQueueStatus): void {
        Vue.set(state, 'queued_jobs', payload.queued_jobs)
        Vue.set(state, 'queue_state', payload.queue_state)
    },

    setQueueState(state, queueState: QueueState): void {
        Vue.set(state, 'queue_state', queueState)
    },
}
