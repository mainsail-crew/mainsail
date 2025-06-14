import { GetterTree } from 'vuex'
import { ServerHistoryState, ServerHistoryStateJob } from '@/store/server/history/types'

// eslint-disable-next-line
export const getters: GetterTree<ServerHistoryState, any> = {
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

    getPrintJobsForGcodes:
        (state) =>
        (
            filename: string,
            modified: number,
            filesize: number,
            uuid: string | null,
            job_id: string | null
        ): ServerHistoryStateJob[] => {
            if (state.jobs.length === 0) return []

            // find jobs via file uuid
            if (uuid) return state.jobs.filter((job) => job.metadata?.uuid === uuid)

            // find jobs via metadata
            const jobs = state.jobs.filter((job) => {
                return job.metadata?.size === filesize && Math.round((job.metadata?.modified ?? 0) * 1000) === modified
            })
            if (jobs.length) return jobs
            if (job_id) return jobs.filter((job) => job.job_id === job_id)

            return []
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
        const hideStatus = rootState.gui.view.history.hidePrintStatus

        return state.jobs.filter((job: ServerHistoryStateJob) => {
            return !hideStatus.includes(job.status)
        })
    },
}
