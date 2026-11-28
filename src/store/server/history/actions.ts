import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerHistoryState, ServerHistoryStateJob } from '@/store/server/history/types'
import { RootState } from '@/store/types'
import { isJsonRpcError, NAMESPACE_NOT_FOUND } from '@/types/moonraker'
import type { HistoryChangedNotification, HistoryJob } from '@/types/moonraker/HistoryRPC'

const LOG_PREFIX = '[Server][History]'
const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

const PAGE_SIZE = 50
const INIT_MAX_JOBS = 100
const NOTES_NAMESPACE = 'history_notes'

/** Converts the history_notes namespace (`{ [job_id]: { text } }`) into a map of job ids and notes */
const parseNotes = (value: unknown): Record<string, string> => {
    if (typeof value !== 'object' || value === null) return {}

    const notes: Record<string, string> = {}
    Object.entries(value as Record<string, unknown>).forEach(([jobId, entry]) => {
        const text = (entry as { text?: unknown } | null)?.text
        if (typeof text === 'string') notes[jobId] = text
    })

    return notes
}

/** Loads jobs page by page, newest first. Without max all jobs are loaded. */
const fetchJobPages = async (max: number | null): Promise<{ jobs: HistoryJob[]; allLoaded: boolean }> => {
    const jobs = new Map<string, HistoryJob>()

    while (max === null || jobs.size < max) {
        const start = jobs.size
        const response = await Vue.$socket.emitAndWait('server.history.list', { start, limit: PAGE_SIZE })

        // a job started during the requests shifts the offsets, so jobs can be returned twice
        response.jobs.forEach((job) => jobs.set(job.job_id, job))

        if (response.jobs.length < PAGE_SIZE) return { jobs: [...jobs.values()], allLoaded: true }
    }

    return { jobs: [...jobs.values()], allLoaded: false }
}

export const actions: ActionTree<ServerHistoryState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async init({ dispatch }): Promise<void> {
        logDebug('init')

        try {
            await Promise.all([dispatch('fetchJobs', INIT_MAX_JOBS), dispatch('fetchTotals')])
        } catch (error) {
            // connection loss, timeouts etc. are handled by server/init
            if (!isJsonRpcError(error)) throw error

            // Moonraker answered with an error: the component is optional, so report it instead of failing the init
            logError('Failed to initialize history:', error)
            await dispatch('server/addFailedInitComponent', 'history', { root: true })
        }
    },

    /** Loads the jobs including their notes. Without max all jobs are loaded. */
    async fetchJobs({ commit, dispatch }, max: number | null = null): Promise<void> {
        const { jobs, allLoaded } = await fetchJobPages(max)
        const notes = (await dispatch('fetchNotes')) as Record<string, string>

        const jobsWithNotes = jobs.map((job): ServerHistoryStateJob => {
            const note = notes[job.job_id]
            return note === undefined ? job : { ...job, note }
        })

        commit('setJobs', jobsWithNotes)
        commit('setAllLoaded', allLoaded)
    },

    async fetchNotes(): Promise<Record<string, string>> {
        try {
            const response = await Vue.$socket.emitAndWait('server.database.get_item', { namespace: NOTES_NAMESPACE })

            return parseNotes(response.value)
        } catch (error) {
            // the namespace is created with the first note
            if (isJsonRpcError(error) && error.code === NAMESPACE_NOT_FOUND) return {}

            throw error
        }
    },

    async fetchTotals({ commit }): Promise<void> {
        const response = await Vue.$socket.emitAndWait('server.history.totals')

        commit('setTotals', {
            job_totals: response.job_totals,
            auxiliary_totals: response.auxiliary_totals ?? [],
        })
    },

    /** Loads all jobs, e.g. for the statistics */
    async loadAllJobs({ dispatch }): Promise<void> {
        await dispatch('fetchJobs')
    },

    async notifyHistoryChanged({ commit, dispatch }, payload: HistoryChangedNotification): Promise<void> {
        commit('setJob', payload.job)

        // Moonraker only updates the totals when a job is finished
        if (payload.action !== 'finished') return

        try {
            await dispatch('fetchTotals')
        } catch (error) {
            logError('Failed to update totals:', error)
        }
    },

    /** Deletes a job. Moonraker does not send a notification for deleted jobs, so the state is updated here. */
    async deleteJob({ commit }, uid: string): Promise<void> {
        const response = await Vue.$socket.emitAndWait('server.history.delete_job', { uid })

        commit('removeJobs', response.deleted_jobs)
    },

    async saveNote({ commit }, payload: { job_id: string; note: string }): Promise<void> {
        await Vue.$socket.emitAndWait('server.database.post_item', {
            namespace: NOTES_NAMESPACE,
            key: payload.job_id,
            value: { text: payload.note },
        })

        commit('setJobNote', payload)
    },
}
