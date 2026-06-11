import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerHistoryState } from '@/store/server/history/types'

export const mutations: MutationTree<ServerHistoryState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    resetJobs(state) {
        state.jobs = []
    },

    setTotals(state, payload) {
        state.job_totals = payload
    },

    setAuxiliaryTotals(state, payload) {
        state.auxiliary_totals = payload
    },

    setHistoryNotes(state, payload) {
        const job = state.jobs.find((job) => job.job_id === payload.job_id)
        if (job) job.note = payload.text
    },

    addJob(state, payload) {
        const jobs = [...state.jobs]
        jobs.push(payload)

        state.jobs = jobs
    },

    updateJob(state, payload) {
        const index = state.jobs.findIndex((job) => job.job_id === payload.job_id)
        if (index !== -1) state.jobs[index] = payload
    },

    destroyJob(state, payload) {
        const index = state.jobs.findIndex((job) => job.job_id === payload)
        if (index !== -1) state.jobs.splice(index, 1)
    },

    setAllLoaded(state) {
        state.all_loaded = true
    },
}
