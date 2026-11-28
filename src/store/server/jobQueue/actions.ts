import Vue from 'vue'
import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { ServerJobQueueEntry, ServerJobQueueState, ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { isJsonRpcError } from '@/types/moonraker'
import type { JobQueueChangedNotification } from '@/types/moonraker/JobQueueRPC'

const LOG_PREFIX = '[Server][JobQueue]'
const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

const toQueueEntry = (job: ServerJobQueueStateJob): ServerJobQueueEntry => ({
    filename: job.filename,
    count: job.combinedIds.length + 1,
})

const toFilenames = (entries: ServerJobQueueEntry[]): string[] =>
    entries.flatMap((entry) => Array<string>(entry.count).fill(entry.filename))

export const actions: ActionTree<ServerJobQueueState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async init({ commit, dispatch }): Promise<void> {
        logDebug('init')

        try {
            const response = await Vue.$socket.emitAndWait('server.job_queue.status')

            commit('setStatus', response)
        } catch (error) {
            // connection loss, timeouts etc. are handled by server/init
            if (!isJsonRpcError(error)) throw error

            // Moonraker answered with an error: the component is optional, so report it instead of failing the init
            logError('Failed to initialize job queue:', error)
            await dispatch('server/addFailedInitComponent', 'job_queue', { root: true })
        }
    },

    notifyJobQueueChanged({ commit }, payload: JobQueueChangedNotification): void {
        // the queue is only sent when it has changed
        if (payload.updated_queue === null) {
            commit('setQueueState', payload.queue_state)
            return
        }

        commit('setStatus', { queued_jobs: payload.updated_queue, queue_state: payload.queue_state })
    },

    /** Adds files to the end of the queue. The same filename can be added multiple times. */
    async addJobs({ commit }, filenames: string[]): Promise<void> {
        const response = await Vue.$socket.emitAndWait('server.job_queue.post_job', { filenames })

        commit('setStatus', response)
    },

    async deleteJobs({ commit }, jobIds: string[]): Promise<void> {
        const response = await Vue.$socket.emitAndWait('server.job_queue.delete_job', { job_ids: jobIds })

        commit('setStatus', response)
    },

    /** Replaces the queue. Moonraker cannot reorder jobs, so the whole queue is posted again. */
    async replaceQueue({ commit }, entries: ServerJobQueueEntry[]): Promise<void> {
        const response = await Vue.$socket.emitAndWait('server.job_queue.post_job', {
            filenames: toFilenames(entries),
            reset: true,
        })

        commit('setStatus', response)
    },

    /** Sets how often a (combined) job is printed */
    async setJobCount({ dispatch, getters }, payload: { job_id: string; count: number }): Promise<void> {
        if (!Number.isInteger(payload.count) || payload.count < 1) {
            throw new RangeError(`Invalid job count: ${payload.count}`)
        }

        const jobs = getters.jobs as ServerJobQueueStateJob[]
        if (!jobs.some((job) => job.job_id === payload.job_id)) return

        const entries = jobs.map((job) =>
            job.job_id === payload.job_id ? { filename: job.filename, count: payload.count } : toQueueEntry(job)
        )

        await dispatch('replaceQueue', entries)
    },

    async moveJob({ dispatch, getters }, payload: { oldIndex: number; newIndex: number }): Promise<void> {
        const entries = (getters.jobs as ServerJobQueueStateJob[]).map(toQueueEntry)
        if (payload.oldIndex < 0 || payload.oldIndex >= entries.length) return

        const [entry] = entries.splice(payload.oldIndex, 1)
        entries.splice(payload.newIndex, 0, entry)

        await dispatch('replaceQueue', entries)
    },

    /** Moves a (combined) job to the front of the queue and starts the queue */
    async startJob({ dispatch, getters }, jobId: string): Promise<void> {
        const jobs = getters.jobs as ServerJobQueueStateJob[]
        const job = jobs.find((entry) => entry.job_id === jobId)
        if (!job) return

        const entries = [job, ...jobs.filter((entry) => entry !== job)].map(toQueueEntry)

        await dispatch('replaceQueue', entries)
        await dispatch('start')
    },

    async start({ commit }): Promise<void> {
        const response = await Vue.$socket.emitAndWait('server.job_queue.start', undefined, {
            loading: 'startJobqueue',
        })

        commit('setStatus', response)
    },

    async pause({ commit }): Promise<void> {
        const response = await Vue.$socket.emitAndWait('server.job_queue.pause', undefined, {
            loading: 'pauseJobqueue',
        })

        commit('setStatus', response)
    },
}
