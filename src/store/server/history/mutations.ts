import { getDefaultState } from './index'
import Vue from 'vue'
import { MutationTree } from 'vuex'
import { ServerHistoryState, ServerHistoryStateJob } from '@/store/server/history/types'
import type { HistoryAuxiliaryTotal, HistoryJobTotals } from '@/types/moonraker/HistoryRPC'

export const mutations: MutationTree<ServerHistoryState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    setJobs(state, jobs: ServerHistoryStateJob[]): void {
        Vue.set(state, 'jobs', jobs)
    },

    /** Replaces an existing job or prepends a new one, because the list is sorted from newest to oldest */
    setJob(state, job: ServerHistoryStateJob): void {
        const index = state.jobs.findIndex((entry) => entry.job_id === job.job_id)
        if (index === -1) {
            state.jobs.unshift(job)
            return
        }

        // keep the note, because it is not part of the job sent by Moonraker
        state.jobs.splice(index, 1, { ...job, note: job.note ?? state.jobs[index].note })
    },

    removeJobs(state, jobIds: string[]): void {
        Vue.set(
            state,
            'jobs',
            state.jobs.filter((job) => !jobIds.includes(job.job_id))
        )
    },

    setJobNote(state, payload: { job_id: string; note: string }): void {
        const index = state.jobs.findIndex((job) => job.job_id === payload.job_id)
        if (index === -1) return

        state.jobs.splice(index, 1, { ...state.jobs[index], note: payload.note })
    },

    setTotals(state, payload: { job_totals: HistoryJobTotals; auxiliary_totals: HistoryAuxiliaryTotal[] }): void {
        Vue.set(state, 'job_totals', payload.job_totals)
        Vue.set(state, 'auxiliary_totals', payload.auxiliary_totals)
    },

    setAllLoaded(state, allLoaded: boolean): void {
        Vue.set(state, 'all_loaded', allLoaded)
    },
}
