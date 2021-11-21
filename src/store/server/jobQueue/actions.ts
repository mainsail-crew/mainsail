import Vue from 'vue'
import { ActionTree } from 'vuex'
import {RootState} from '@/store/types'
import {ServerJobQueueState} from '@/store/server/jobQueue/types'

export const actions: ActionTree<ServerJobQueueState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit('server.job_queue.status', { }, { action: 'server/jobQueue/getStatus' })
    },

    getStatus({ commit }, payload) {
        if ('queued_jobs' in payload) commit('setQueuedJobs', payload.queued_jobs)
        if ('queue_status' in payload) commit('setQueueStatus', payload.queue_status)
        window.console.log(payload)
    },

    addToQueue(_, filenames: string[]) {
        Vue.$socket.emit('server.job_queue.post_job', { filenames: filenames }, { action: 'server/jobQueue/getStatus' })
    },

    deleteFromQueue(_, jobIds: string[]) {
        Vue.$socket.emit('server.job_queue.delete_job', { filenames: jobIds }, { action: 'server/jobQueue/getStatus' })
    }

}