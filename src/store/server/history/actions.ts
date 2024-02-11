import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerHistoryState, ServerHistoryStateJob } from '@/store/server/history/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<ServerHistoryState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit(
            'server.history.list',
            { start: 0, limit: 50, max: 100 },
            { action: 'server/history/getHistory' }
        )
        Vue.$socket.emit('server.history.totals', {}, { action: 'server/history/getTotals' })
    },

    getTotals({ commit }, payload) {
        commit('setTotals', payload.job_totals)
    },

    async getHistory({ commit, dispatch, state }, payload) {
        if ('requestParams' in payload && (payload.requestParams?.start ?? 0) === 0) commit('resetJobs')

        payload.jobs?.forEach((job: ServerHistoryStateJob) => {
            if (state.jobs.findIndex((stateJob) => stateJob.job_id === job.job_id) === -1) commit('addJob', job)
        })

        const start = payload.requestParams?.start ?? 0
        const limit = payload.requestParams?.limit ?? 50
        const max = payload.requestParams?.max ?? null

        if (limit > 0 && (max === null || max > start + limit) && payload.jobs?.length === limit) {
            Vue.$socket.emit(
                'server.history.list',
                {
                    start: start + limit,
                    limit: limit,
                    max: max,
                },
                { action: 'server/history/getHistory' }
            )

            // stop here until all pulls are done
            return
        }

        if (payload.jobs?.length < limit) {
            dispatch('socket/removeLoading', { name: 'historyLoadAll' }, { root: true })
            commit('setAllLoaded')
        }

        dispatch('loadHistoryNotes')
    },

    loadHistoryNotes({ dispatch, rootState }) {
        if (rootState.server?.dbNamespaces.includes('history_notes'))
            Vue.$socket.emit(
                'server.database.get_item',
                { namespace: 'history_notes' },
                { action: 'server/history/initHistoryNotes' }
            )
        else dispatch('socket/removeInitModule', 'server/history/init', { root: true })
    },

    async initHistoryNotes({ commit, dispatch }, payload) {
        const job_ids = Object.keys(payload.value)

        for (const job_id of job_ids) {
            const noteObject: { text: string } = payload.value[job_id]
            await commit('setHistoryNotes', {
                job_id,
                text: noteObject.text,
            })
        }

        await dispatch('socket/removeInitModule', 'server/history/init', { root: true })
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
