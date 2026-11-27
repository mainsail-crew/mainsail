import { GetterTree } from 'vuex'
import { ServerJobQueueState, ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<ServerJobQueueState, RootState> = {
    getJobs: (state, getters, rootState, rootGetters) => {
        const jobs: ServerJobQueueStateJob[] = []

        state.queued_jobs.forEach((queuedJob) => {
            const job = { ...queuedJob }

            if (jobs.length && jobs[jobs.length - 1].filename === job.filename) {
                jobs[jobs.length - 1].combinedIds?.push(job.job_id)
                return
            }

            job.metadata = rootGetters['files/getGcodeFile'](job.filename)
            job.combinedIds = []

            jobs.push(job)
        })

        return jobs
    },

    getJobsCount: (state) => {
        return state.queued_jobs.length
    },
}
