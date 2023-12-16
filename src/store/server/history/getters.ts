import { GetterTree } from 'vuex'
import {
    ServerHistoryState,
    ServerHistoryStateAllPrintStatusEntry,
    ServerHistoryStateJob,
} from '@/store/server/history/types'
import { mdiAlertOutline, mdiCheckboxMarkedCircleOutline, mdiCloseCircleOutline, mdiProgressClock } from '@mdi/js'
import i18n from '@/plugins/i18n'

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

    getAllPrintStatusArrayAll(state, getters, rootState) {
        const output: ServerHistoryStateAllPrintStatusEntry[] = []

        state.jobs.forEach((current) => {
            const index = output.findIndex((element) => element.name === current.status)
            if (index !== -1) output[index].value += 1
            else {
                const displayName = i18n.te(`History.StatusValues.${current.status}`, 'en')
                    ? i18n.t(`History.StatusValues.${current.status}`).toString()
                    : current.status

                const itemStyle = {
                    opacity: 0.9,
                    color: '#424242',
                    borderColor: '#1E1E1E',
                    borderWidth: 2,
                    borderRadius: 3,
                }

                switch (current.status) {
                    case 'completed':
                        itemStyle['color'] = '#BDBDBD'
                        break

                    case 'in_progress':
                        itemStyle['color'] = '#EEEEEE'
                        break

                    case 'cancelled':
                        itemStyle['color'] = '#616161'
                        break
                }

                output.push({
                    name: current.status,
                    displayName,
                    value: 1,
                    itemStyle,
                    showInTable: !rootState.gui?.view.history.hidePrintStatus.includes(current.status),
                })
            }
        })

        return output
    },

    getAllPrintStatusArray(state, getters) {
        const output: ServerHistoryStateAllPrintStatusEntry[] = [...getters.getAllPrintStatusArrayAll]
        const totalCount = state.jobs.length

        const otherLimit = totalCount * 0.05
        const others = output.filter((entry) => entry.value < otherLimit)
        if (others.length > 1) {
            let otherValue = 0

            others.forEach((otherGroup) => {
                const index = output.findIndex((entry) => entry.name === otherGroup.name)
                if (index !== -1) {
                    otherValue += output[index].value
                    output.splice(index, 1)
                }
            })

            output.push({
                name: 'others',
                displayName: i18n.t(`History.StatusValues.Others`).toString(),
                value: otherValue,
                itemStyle: {
                    opacity: 0.9,
                    color: '#616161',
                    borderColor: '#1E1E1E',
                    borderWidth: 2,
                    borderRadius: 3,
                },
                showInTable: true,
            })
        }

        return output
    },

    getSelectedPrintStatusArray(state, getters, rootState) {
        const output: ServerHistoryStateAllPrintStatusEntry[] = []

        rootState.gui.view.history.selectedJobs.forEach((current: ServerHistoryStateJob) => {
            const index = output.findIndex((element) => element.name === current.status)
            if (index !== -1) output[index].value += 1
            else {
                const displayName = i18n.te(`History.StatusValues.${current.status}`, 'en')
                    ? i18n.t(`History.StatusValues.${current.status}`).toString()
                    : current.status
                const itemStyle = {
                    opacity: 0.9,
                    color: '#424242',
                    borderColor: '#1E1E1E',
                    borderWidth: 2,
                    borderRadius: 3,
                }

                switch (current.status) {
                    case 'completed':
                        itemStyle['color'] = '#BDBDBD'
                        break

                    case 'in_progress':
                        itemStyle['color'] = '#EEEEEE'
                        break

                    case 'cancelled':
                        itemStyle['color'] = '#616161'
                        break
                }

                output.push({
                    name: current.status,
                    displayName,
                    value: 1,
                    itemStyle: itemStyle,
                    showInTable: !rootState.gui?.view.history.hidePrintStatus.includes(current.status),
                })
            }
        })

        return output
    },

    getFilamentUsageArray(state, getters, rootState) {
        // eslint-disable-next-line
        const output: any = []
        const startDate = new Date()
        startDate.setTime(startDate.getTime() - 60 * 60 * 24 * 14 * 1000)
        startDate.setHours(0, 0, 0, 0)

        let jobsFiltered = [
            ...state.jobs.filter((job) => new Date(job.start_time * 1000) >= startDate && job.filament_used > 0),
        ]
        if (rootState.gui.view.history.selectedJobs.length)
            jobsFiltered = [
                ...rootState.gui.view.history.selectedJobs.filter(
                    (job: ServerHistoryStateJob) =>
                        new Date(job.start_time * 1000) >= startDate && job.filament_used > 0
                ),
            ]

        for (let i = 0; i <= 14; i++) {
            const tmpDate = new Date()
            tmpDate.setTime(startDate.getTime() + 60 * 60 * 24 * i * 1000)

            output.push([new Date(tmpDate).setHours(0, 0, 0, 0), 0])
        }

        if (jobsFiltered.length) {
            jobsFiltered.forEach((current) => {
                const currentStartDate = new Date(current.start_time * 1000).setHours(0, 0, 0, 0)
                // eslint-disable-next-line
                const index = output.findIndex((element: any) => element[0] === currentStartDate)
                if (index !== -1) output[index][1] += Math.round(current.filament_used) / 1000
            })
        }

        // eslint-disable-next-line
        return output.sort((a: any, b: any) => {
            return b[0] - a[0]
        })
    },

    getPrinttimeAvgArray(state, getters, rootState) {
        const output = [0, 0, 0, 0, 0]
        const startDate = new Date(new Date().getTime() - 60 * 60 * 24 * 14 * 1000)

        let jobsFiltered = [
            ...state.jobs.filter((job) => new Date(job.start_time * 1000) >= startDate && job.status === 'completed'),
        ]
        if (rootState.gui.view.history.selectedJobs.length)
            jobsFiltered = [
                ...rootState.gui.view.history.selectedJobs.filter(
                    (job: ServerHistoryStateJob) =>
                        new Date(job.start_time * 1000) >= startDate && job.status === 'completed'
                ),
            ]

        if (jobsFiltered.length) {
            jobsFiltered.forEach((current) => {
                if (current.print_duration > 0 && current.print_duration <= 60 * 60 * 2) output[0]++
                else if (current.print_duration > 60 * 60 * 2 && current.print_duration <= 60 * 60 * 6) output[1]++
                else if (current.print_duration > 60 * 60 * 6 && current.print_duration <= 60 * 60 * 12) output[2]++
                else if (current.print_duration > 60 * 60 * 12 && current.print_duration <= 60 * 60 * 24) output[3]++
                else if (current.print_duration > 60 * 60 * 24) output[4]++
            })
        }

        return output
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
                return job.metadata?.size === filesize && Math.round(job.metadata?.modified * 1000) === modified
            })
            if (jobs.length) return jobs
            if (job_id) return jobs.filter((job) => job.job_id === job_id)

            return []
        },

    getPrintStatusByFilename: (state) => (filename: string, modified: number) => {
        if (state.jobs.length) {
            const job = state.jobs.find((job) => {
                return job.filename === filename && Math.round(job.metadata?.modified * 1000) === modified
            })

            return job?.status ?? ''
        }

        return ''
    },

    getPrintStatusIconColor: () => (status: string) => {
        switch (status) {
            case 'in_progress':
                return 'blue accent-3' //'blue-grey darken-1'
            case 'completed':
                return 'green' //'green'
            case 'cancelled':
                return 'red'

            default:
                return 'orange'
        }
    },

    getPrintStatusTextColor: () => (status: string) => {
        switch (status) {
            case 'in_progress':
                return 'blue--text' //'blue-grey darken-1'
            case 'completed':
                return 'green--text' //'green'
            case 'cancelled':
                return 'red--text'

            default:
                return 'orange--text'
        }
    },

    getPrintStatusIcon: () => (status: string) => {
        switch (status) {
            case 'in_progress':
                return mdiProgressClock
            case 'completed':
                return mdiCheckboxMarkedCircleOutline
            case 'cancelled':
                return mdiCloseCircleOutline

            default:
                return mdiAlertOutline
        }
    },

    getFilterdJobList: (state, getters, rootState) => {
        const hideStatus = rootState.gui.view.history.hidePrintStatus

        return state.jobs.filter((job: ServerHistoryStateJob) => {
            return !hideStatus.includes(job.status)
        })
    },
}
