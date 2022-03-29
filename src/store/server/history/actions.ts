import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerHistoryState, ServerHistoryStateJob } from '@/store/server/history/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<ServerHistoryState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit('server.history.list', { start: 0, limit: 50 }, { action: 'server/history/getHistory' })
        Vue.$socket.emit('server.history.totals', {}, { action: 'server/history/getTotals' })
    },

    getTotals({ commit }, payload) {
        commit('setTotals', payload.job_totals)
    },

    getHistory({ commit, dispatch, state }, payload) {
        if ('requestParams' in payload && 'start' in payload.requestParams && payload.requestParams.start === 0)
            commit('resetJobs')

        payload.jobs?.forEach((job: ServerHistoryStateJob) => {
            if (state.jobs.findIndex((stateJob) => stateJob.job_id === job.job_id) === -1) commit('addJob', job)
        })

        if (payload.requestParams?.limit > 0 && payload.jobs?.length === payload.requestParams.limit)
            Vue.$socket.emit(
                'server.history.list',
                {
                    start: payload.requestParams.start + payload.requestParams.limit,
                    limit: payload.requestParams.limit,
                },
                { action: 'server/history/getHistory' }
            )
        else dispatch('loadHistoryNotes')
    },

    loadHistoryNotes({ rootState }) {
        if (rootState.server?.dbNamespaces.includes('history_notes'))
            Vue.$socket.emit(
                'server.database.get_item',
                { namespace: 'history_notes' },
                { action: 'server/history/initHistoryNotes' }
            )
    },

    initHistoryNotes({ commit, state }, payload) {
        const job_ids = Object.keys(payload.value)

        job_ids.forEach((job_id: string) => {
            const noteObject: { text: string } = payload.value[job_id]
            commit('setHistoryNotes', {
                job_id,
                text: noteObject.text,
            })
        })
    },

    getChanged({ commit }, payload) {
        if (payload.action === 'added') commit('addJob', payload.job)
        else if (payload.action === 'finished') commit('updateJob', payload.job)

        Vue.$socket.emit('server.history.totals', {}, { action: 'server/history/getTotals' })
    },

    getDeletedJobs({ commit }, payload) {
        if ('deleted_jobs' in payload && Array.isArray(payload.deleted_jobs)) {
            payload.deleted_jobs.forEach((jobId: ServerHistoryStateJob) => {
                commit('destroyJob', jobId)
            })
        }
    },

    saveHistoryNote({ commit }, payload: { job_id: string; note: string }) {
        Vue.$socket.emit('server.database.post_item', {
            namespace: 'history_notes',
            key: payload.job_id,
            value: { text: payload.note },
        })

        commit('setHistoryNotes', {
            job_id: payload.job_id,
            text: payload.note,
        })
    },
}
