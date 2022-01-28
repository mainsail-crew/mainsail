import { Module } from 'vuex'
import { ServerJobQueueState } from '@/store/server/jobQueue/types'
import { actions } from '@/store/server/jobQueue/actions'
import { mutations } from '@/store/server/jobQueue/mutations'
import { getters } from '@/store/server/jobQueue/getters'

export const getDefaultState = (): ServerJobQueueState => {
    return {
        queued_jobs: [],
        queue_state: '',
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const jobQueue: Module<ServerJobQueueState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
