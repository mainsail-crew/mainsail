import { GetterTree } from 'vuex'
import { ServerJobQueueState, ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import Vue from 'vue'

// eslint-disable-next-line
export const getters: GetterTree<ServerJobQueueState, any> = {
    getJobs: (state, getters, rootState, rootGetters) => {
        const jobs: ServerJobQueueStateJob[] = []

        state.queued_jobs.forEach((queuedJob) => {
            const job = { ...queuedJob }

            if (jobs.length && jobs[jobs.length - 1].filename === job.filename) {
                jobs[jobs.length - 1].combinedIds?.push(job.job_id)
                return
            }

            const file = rootGetters['files/getFile']('gcodes/' + job.filename)
            if (!file?.metadataPulled)
                Vue.$socket.emit('server.files.metadata', { filename: job.filename }, { action: 'files/getMetadata' })
            job.metadata = file
            job.combinedIds = []

            jobs.push(job)
        })

        return jobs
    },

    getJobsCount: (state) => {
        return state.queued_jobs.length
    },
}
