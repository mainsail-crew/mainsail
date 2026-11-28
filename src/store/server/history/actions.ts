import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerHistoryState } from '@/store/server/history/types'
import { RootState } from '@/store/types'
import { isJsonRpcError } from '@/types/moonraker'
import type { HistoryChangedNotification } from '@/types/moonraker/HistoryRPC'
import {
    addNotes,
    fetchJobPages,
    fetchNotes,
    INIT_MAX_JOBS,
    logDebug,
    logError,
    NOTES_NAMESPACE,
} from '@/store/server/history/helpers'

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
    async fetchJobs({ commit }, max: number | null = null): Promise<void> {
        const [{ jobs, allLoaded }, notes] = await Promise.all([fetchJobPages(max), fetchNotes()])

        commit('setJobs', addNotes(jobs, notes))
        commit('setAllLoaded', allLoaded)
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
