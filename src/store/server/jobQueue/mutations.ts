import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import {ServerJobQueueState, ServerJobQueueStateJobs} from '@/store/server/jobQueue/types'
import Vue from 'vue'

export const mutations: MutationTree<ServerJobQueueState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setQueuedJobs(state, payload: ServerJobQueueStateJobs[]) {
        Vue.set(state, 'queued_jobs', payload)
    },

    setQueueStatus(state, payload: string) {
        Vue.set(state, 'queue_status', payload)
    }
}