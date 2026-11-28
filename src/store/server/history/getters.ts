import { GetterTree } from 'vuex'
import {
    ServerHistoryFileReference,
    ServerHistoryJobIndex,
    ServerHistoryState,
    ServerHistoryStateJob,
} from '@/store/server/history/types'
import { RootState } from '@/store/types'
import { getFileKey, pushToIndex } from '@/store/server/history/helpers'

export const getters: GetterTree<ServerHistoryState, RootState> = {
    // the gcode files list looks up the jobs of every file, so the jobs are indexed once
    jobIndex(state): ServerHistoryJobIndex {
        const index: ServerHistoryJobIndex = { byUuid: new Map(), byFile: new Map(), byJobId: new Map() }

        state.jobs.forEach((job) => {
            index.byJobId.set(job.job_id, job)
            if (job.metadata?.uuid) pushToIndex(index.byUuid, job.metadata.uuid, job)
            if (job.metadata?.size === undefined) return

            const modified = Math.round((job.metadata.modified ?? 0) * 1000)
            pushToIndex(index.byFile, getFileKey(job.metadata.size, modified), job)
        })

        return index
    },

    getJobsForFile:
        (_state, getters) =>
        (file: ServerHistoryFileReference): ServerHistoryStateJob[] => {
            const index: ServerHistoryJobIndex = getters.jobIndex

            // find jobs via file uuid
            if (file.uuid) return index.byUuid.get(file.uuid) ?? []

            // find jobs via metadata
            const jobs = index.byFile.get(getFileKey(file.size, file.modified)) ?? []
            if (jobs.length) return jobs

            // find the last job of the file
            const job = file.job_id ? index.byJobId.get(file.job_id) : undefined
            return job ? [job] : []
        },
}
