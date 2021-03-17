export default {
	reset({ commit }) {
		commit('reset')
	},

	getHistory({ commit }, payload) {
		commit('reset')

		payload.jobs.forEach(job => {
			commit('addJob', job)
		})
	},

	getChanged({ commit }, payload) {
		if (payload.action === 'added') commit('addJob', payload.job)
		else if (payload.action === 'finished') commit('updateJob', payload.job)
	},

	getDeletedJobs({ commit }, payload) {
		if ('deleted_jobs' in payload && Array.isArray(payload.deleted_jobs)) {
			payload.deleted_jobs.forEach(jobId => {
				commit('destroyJob', jobId)
			})
		}
	}

}