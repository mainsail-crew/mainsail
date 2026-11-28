import { GetterTree } from 'vuex'
import { ServerJobQueueState, ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { RootState } from '@/store/types'
import type { FileStateGcodefile } from '@/store/files/types'

export const getters: GetterTree<ServerJobQueueState, RootState> = {
    /** Queued jobs, consecutive jobs of the same file are combined into one entry */
    jobs: (state, _getters, _rootState, rootGetters): ServerJobQueueStateJob[] => {
        const getGcodeFile = rootGetters['files/getGcodeFile'] as (path: string) => FileStateGcodefile | null
        const jobs: ServerJobQueueStateJob[] = []

        state.queued_jobs.forEach((queuedJob) => {
            const lastJob = jobs[jobs.length - 1]
            if (lastJob?.filename === queuedJob.filename) {
                lastJob.combinedIds.push(queuedJob.job_id)
                return
            }

            jobs.push({ ...queuedJob, metadata: getGcodeFile(queuedJob.filename), combinedIds: [] })
        })

        return jobs
    },

    /** Number of queued jobs, combined jobs are counted individually */
    jobsCount: (state): number => state.queued_jobs.length,
}
