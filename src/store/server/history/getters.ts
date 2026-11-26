import { GetterTree } from 'vuex'
import { ServerHistoryState, ServerHistoryStateJob } from '@/store/server/history/types'
import { RootState } from '@/store/types'

interface PrintJobIndex {
    byUuid: Map<string, ServerHistoryStateJob[]>
    byFile: Map<string, ServerHistoryStateJob[]>
    byJobId: Map<string, ServerHistoryStateJob>
}

/** Key to find the jobs of a file without uuid. `modified` is in milliseconds. */
const getFileKey = (size: number, modified: number) => `${size}-${modified}`

const pushToIndex = (index: Map<string, ServerHistoryStateJob[]>, key: string, job: ServerHistoryStateJob) => {
    const jobs = index.get(key)
    if (jobs) jobs.push(job)
    else index.set(key, [job])
}

export const getters: GetterTree<ServerHistoryState, RootState> = {
    getTotalPrintTime(state) {
        let output = 0

        state.jobs.forEach((current) => {
            output += current.print_duration
        })

        return output
    },

    getTotalCompletedPrintTime(state) {
        let output = 0

        state.jobs.forEach((current) => {
            if (current.status === 'completed') output += current.print_duration
        })

        return output
    },

    getLongestPrintTime(state) {
        let output = 0

        state.jobs.forEach((current) => {
            if (current.print_duration > output) output = current.print_duration
        })

        return output
    },

    getTotalFilamentUsed(state) {
        let output = 0

        state.jobs.forEach((current) => {
            output += current.filament_used
        })

        return output
    },

    getTotalJobsCount(state) {
        return state.jobs.length
    },

    getTotalCompletedJobsCount(state) {
        return state.jobs.filter((job) => job.status === 'completed').length
    },

    getAvgPrintTime(state, getters) {
        const totalCompletedPrintTime = getters.getTotalCompletedPrintTime
        const totalCompletedJobsCount = getters.getTotalCompletedJobsCount

        return totalCompletedPrintTime > 0 && totalCompletedJobsCount > 0
            ? Math.round(totalCompletedPrintTime / totalCompletedJobsCount)
            : 0
    },

    getPrintStatus: (state) => (jobId: string) => {
        if (state.jobs.length) {
            const job = state.jobs.find((job) => job.job_id === jobId)

            return job?.status ?? ''
        }

        return ''
    },

    getPrintJobById: (state) => (job_id: string) => {
        if (state.jobs.length === 0) return

        return state.jobs.find((job) => job.job_id === job_id)
    },

    // the gcode files list looks up the jobs of every file, so the jobs are indexed once
    getPrintJobIndex(state): PrintJobIndex {
        const index: PrintJobIndex = { byUuid: new Map(), byFile: new Map(), byJobId: new Map() }

        state.jobs.forEach((job) => {
            index.byJobId.set(job.job_id, job)
            if (job.metadata?.uuid) pushToIndex(index.byUuid, job.metadata.uuid, job)
            if (job.metadata?.size === undefined) return

            const modified = Math.round((job.metadata.modified ?? 0) * 1000)
            pushToIndex(index.byFile, getFileKey(job.metadata.size, modified), job)
        })

        return index
    },

    getPrintJobsForGcodes:
        (state, getters) =>
        (
            filename: string,
            modified: number,
            filesize: number,
            uuid: string | null,
            job_id: string | null
        ): ServerHistoryStateJob[] => {
            const index: PrintJobIndex = getters.getPrintJobIndex

            // find jobs via file uuid
            if (uuid) return index.byUuid.get(uuid) ?? []

            // find jobs via metadata
            const jobs = index.byFile.get(getFileKey(filesize, modified)) ?? []
            if (jobs.length) return jobs

            // find the last job of the file
            const job = job_id ? index.byJobId.get(job_id) : undefined
            return job ? [job] : []
        },

    getPrintStatusByFilename: (state) => (filename: string, modified: number) => {
        if (state.jobs.length) {
            const job = state.jobs.find((job) => {
                return job.filename === filename && Math.round((job.metadata?.modified ?? 0) * 1000) === modified
            })

            return job?.status ?? ''
        }

        return ''
    },

    getFilteredJobList: (state, getters, rootState) => {
        const hideStatus = rootState.gui?.view?.history?.hidePrintStatus ?? []

        return state.jobs.filter((job: ServerHistoryStateJob) => {
            return !hideStatus.includes(job.status)
        })
    },
}
