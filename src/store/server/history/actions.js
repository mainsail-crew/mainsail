import Vue from "vue";

export default {
	reset({ commit }) {
		commit('reset')
	},

	getTotals({ commit }, payload) {
		commit('setTotals', payload.job_totals)
	},

	getHistory({ commit }, payload) {
		commit('resetJobs')

		payload.jobs.forEach(job => {
			commit('addJob', job)
		})
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