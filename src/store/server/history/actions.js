import Vue from "vue";

export default {
	reset({ commit }) {
		commit('reset')
	},

	getTotals({ commit }, payload) {
		commit('setTotals', payload.job_totals)
	},

	getHistory({ commit, state }, payload) {
		if (
			'requestParams' in payload &&
			'start' in payload.requestParams &&
			payload.requestParams.start === 0
		) commit('resetJobs')

		payload.jobs.forEach(job => {
			if (state.jobs.findIndex(stateJob => stateJob.job_id === job.job_id) === -1) commit('addJob', job)
		})

		if (
			'requestParams' in payload &&
			'start' in payload.requestParams &&
			'limit' in payload.requestParams &&
			payload.requestParams.limit > 0 &&
			payload.jobs.length === payload.requestParams.limit
		) Vue.prototype.$socket.sendObj('server.history.list', { start: payload.requestParams.start + payload.requestParams.limit + 1, limit: payload.requestParams.limit }, 'server/history/getHistory')
	},

	getChanged({ commit }, payload) {
		if (payload.action === 'added') commit('addJob', payload.job)
		else if (payload.action === 'finished') commit('updateJob', payload.job)

		Vue.prototype.$socket.sendObj('server.history.totals', {}, 'server/history/getTotals')
	},

	getDeletedJobs({ commit }, payload) {
		if ('deleted_jobs' in payload && Array.isArray(payload.deleted_jobs)) {
			payload.deleted_jobs.forEach(jobId => {
				commit('destroyJob', jobId)
			})
		}
	}

}