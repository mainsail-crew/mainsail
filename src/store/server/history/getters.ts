import {GetterTree} from 'vuex'
import {ServerHistoryState, ServerHistoryStateJob} from '@/store/server/history/types'

// eslint-disable-next-line
export const getters: GetterTree<ServerHistoryState, any> = {

    getTotalPrintTime(state) {
        let output = 0

        state.jobs.forEach(current => {
            output += current.print_duration
        })

        return output
    },

    getTotalCompletedPrintTime(state) {
        let output = 0

        state.jobs.forEach(current => {
            if (current.status === 'completed') output += current.print_duration
        })

        return output
    },

    getLongestPrintTime(state) {
        let output = 0

        state.jobs.forEach(current => {
            if (current.print_duration > output) output = current.print_duration
        })

        return output
    },

    getTotalFilamentUsed(state) {
        let output = 0

        state.jobs.forEach(current => {
            output += current.filament_used
        })

        return output
    },

    getTotalJobsCount(state) {
        return state.jobs.length
    },

    getTotalCompletedJobsCount(state) {
        return state.jobs.filter(job => job.status === 'completed').length
    },

    getAvgPrintTime(state, getters) {
        const totalCompletedPrintTime = getters.getTotalCompletedPrintTime
        const totalCompletedJobsCount = getters.getTotalCompletedJobsCount

        return totalCompletedPrintTime > 0 && totalCompletedJobsCount > 0 ? Math.round(totalCompletedPrintTime / totalCompletedJobsCount) : 0
    },

    getAllPrintStatusArray(state, getters, rootState) {
        interface allPrintStatusEntryItemStyle {
            opacity: number
            color: string
            borderColor: string
            borderWidth: number
            borderRadius: number
        }
        interface allPrintStatusEntryLabel {
            color: string
        }

        interface allPrintStatusEntry {
            name: string
            value: number
            showInTable: boolean
            itemStyle: allPrintStatusEntryItemStyle
            label: allPrintStatusEntryLabel
        }

        const output: allPrintStatusEntry[] = []

        state.jobs.forEach((current) => {
            const index = output.findIndex(element => element.name === current.status)
            if (index !== -1) output[index].value +=1
            else {
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
                    value: 1,
                    itemStyle: itemStyle,
                    showInTable: !rootState.gui?.view.history.hidePrintStatus.includes(current.status),
                    label: {
                        color: '#fff'
                    }
                })
            }
        })

        return output
    },

    getFilamentUsageArray(state) {
        // eslint-disable-next-line
        const output: any = []
        const startDate = new Date()
        startDate.setTime(startDate.getTime() - 60*60*24*14*1000)
        startDate.setHours(0,0,0,0)
        const jobsFiltered = state.jobs.filter(job => new Date(job.start_time * 1000) >= startDate && job.filament_used > 0)

        for (let i = 0; i <= 14; i++) {
            const tmpDate = new Date()
            tmpDate.setTime(startDate.getTime() + 60*60*24*i*1000)

            output.push([
                new Date(tmpDate).setHours(0,0,0,0),
                0
            ])
        }

        if (jobsFiltered.length) {
            jobsFiltered.forEach(current => {
                const currentStartDate = new Date(current.start_time * 1000).setHours(0,0,0,0)
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

    getPrinttimeAvgArray(state) {
        const output = [0,0,0,0,0]
        const startDate = new Date(new Date().getTime() - 60*60*24*14*1000)
        const jobsFiltered = state.jobs.filter(job => new Date(job.start_time * 1000) >= startDate && job.status === 'completed')

        if (jobsFiltered.length) {
            jobsFiltered.forEach(current => {
                if 		(current.print_duration > 0 		&& current.print_duration <= 60*60*2) 	output[0]++
                else if (current.print_duration > 60*60*2 	&& current.print_duration <= 60*60*6) 	output[1]++
                else if (current.print_duration > 60*60*6 	&& current.print_duration <= 60*60*12) 	output[2]++
                else if (current.print_duration > 60*60*12 	&& current.print_duration <= 60*60*24) 	output[3]++
                else if (current.print_duration > 60*60*24) 										output[4]++
            })
        }

        return output
    },

    getPrintStatus: (state) => (jobId: string) => {
        if (state.jobs.length) {
            const job = state.jobs.find(job => job.job_id === jobId)

            return job?.status ?? ''
        }

        return ''
    },

    getPrintStatusByFilename: (state) => (filename: string, modified: number) => {
        if (state.jobs.length) {
            const job = state.jobs.find((job) => {
                return job.filename === filename && Math.round(job.metadata?.modified*1000) === modified
            })

            return job?.status ?? ''
        }

        return ''
    },

    getPrintStatusChipColor: () => (status: string) => {
        switch(status) {
        case 'in_progress': return 'blue accent-3' //'blue-grey darken-1'
        case 'completed': return 'green' //'green'
        case 'cancelled': return 'red'

        default: return 'orange'
        }
    },

    getPrintStatusChipIcon: () => (status: string) => {
        switch(status) {
        case 'in_progress': return 'mdi-progress-clock'
        case 'completed': return 'mdi-checkbox-marked-circle-outline'
        case 'cancelled': return 'mdi-close-circle-outline'

        default: return 'mdi-alert-outline'
        }
    },

    getFilterdJobList: (state, getters, rootState) => {
        const hideStatus = rootState.gui.view.history.hidePrintStatus

        return state.jobs.filter((job: ServerHistoryStateJob) => {
            return !hideStatus.includes(job.status)
        })
    }
}