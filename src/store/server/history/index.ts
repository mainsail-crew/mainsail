import { Module } from 'vuex'
import { ServerHistoryState } from '@/store/server/history/types'
import { actions } from '@/store/server/history/actions'
import { mutations } from '@/store/server/history/mutations'
import { getters } from '@/store/server/history/getters'
import { RootState } from '@/store/types'

export const getDefaultState = (): ServerHistoryState => {
    return {
        jobs: [],
        job_totals: {
            total_jobs: 0,
            total_time: 0,
            total_print_time: 0,
            total_filament_used: 0,
            longest_job: 0,
            longest_print: 0,
        },
        auxiliary_totals: [],
        all_loaded: false,
    }
}

// initial state
const state = getDefaultState()

export const history: Module<ServerHistoryState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
