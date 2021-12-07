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

    getEvent({ commit }, payload) {
        if ('updated_queue' in payload) commit('setQueuedJobs', payload.updated_queue)
        if ('queue_state' in payload) commit('setQueueState', payload.queue_state)
    },

    getStatus({ commit }, payload) {
        if ('queued_jobs' in payload) commit('setQueuedJobs', payload.queued_jobs)
        if ('queue_state' in payload) commit('setQueueState', payload.queue_state)
    },

    async addToQueue({ state }, filenames: string[]) {
        Vue.$socket.emit('server.job_queue.post_job', { filenames: filenames })
    },

    deleteFromQueue(_, job_ids: string[]) {
        Vue.$socket.emit('server.job_queue.delete_job', { job_ids })
    },

    clearQueue(_) {
        Vue.$socket.emit('server.job_queue.delete_job', { all: true })
    },

    start(_) {
        Vue.$socket.emit('server.job_queue.start', { }, { loading: 'startJobqueue' })
    },

    pause(_) {
        Vue.$socket.emit('server.job_queue.pause', { }, { loading: 'pauseJobqueue' })
    }

}