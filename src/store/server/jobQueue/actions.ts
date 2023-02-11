import Vue from 'vue'
import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { ServerJobQueueState, ServerJobQueueStateJob } from '@/store/server/jobQueue/types'

export const actions: ActionTree<ServerJobQueueState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit('server.job_queue.status', {}, { action: 'server/jobQueue/getStatus' })
    },

    getEvent({ commit }, payload) {
        if ('updated_queue' in payload && payload.updated_queue !== null) commit('setQueuedJobs', payload.updated_queue)
        if ('queue_state' in payload) commit('setQueueState', payload.queue_state)
    },

    async getStatus({ commit, dispatch }, payload) {
        if ('queued_jobs' in payload) await commit('setQueuedJobs', payload.queued_jobs)
        if ('queue_state' in payload) await commit('setQueueState', payload.queue_state)

        await dispatch('socket/removeInitModule', 'server/jobQueue/init', { root: true })
    },

    async addToQueue(_, filenames: string[]) {
        Vue.$socket.emit('server.job_queue.post_job', { filenames: filenames })
    },

    changeCount({ getters }, payload: { job_id: string; count: number }) {
        const filenames: string[] = []
        const jobs = getters['getJobs']

        jobs.forEach((job: ServerJobQueueStateJob) => {
            if (job.job_id === payload.job_id) {
                for (let i = 0; i < payload.count; i++) {
                    filenames.push(job.filename)
                }

                return
            }

            const count = (job.combinedIds?.length ?? 0) + 1
            for (let i = 0; i < count; i++) {
                filenames.push(job.filename)
            }
        })

        Vue.$socket.emit('server.job_queue.post_job', {
            filenames,
            reset: true,
        })
    },

    deleteFromQueue(_, job_ids: string[]) {
        Vue.$socket.emit('server.job_queue.delete_job', { job_ids })
    },

    clearQueue() {
        Vue.$socket.emit('server.job_queue.delete_job', { all: true })
    },

    start() {
        Vue.$socket.emit('server.job_queue.start', {}, { loading: 'startJobqueue' })
    },

    pause() {
        Vue.$socket.emit('server.job_queue.pause', {}, { loading: 'pauseJobqueue' })
    },
}
