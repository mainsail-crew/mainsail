import { Module } from 'vuex'
import { ServerJobQueueState } from '@/store/server/jobQueue/types'
import { actions } from '@/store/server/jobQueue/actions'
import { mutations } from '@/store/server/jobQueue/mutations'
import { getters } from '@/store/server/jobQueue/getters'
import { RootState } from '@/store/types'

export const getDefaultState = (): ServerJobQueueState => {
    return {
        queued_jobs: [],
        queue_state: '',
    }
}

// initial state
const state = getDefaultState()

export const jobQueue: Module<ServerJobQueueState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
