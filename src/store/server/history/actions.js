export default {
	reset({ commit }) {
		commit('reset')
	},

	getHistory({ commit, state }, payload) {
		commit('reset')

		payload.jobs.forEach(job => {
			const index = state.jobs.findIndex(tmpJob => tmpJob.job_id === job.job_id)
			if (index === -1) {
				commit('addJob', job)
			}
		})
	},

	getChanged({ commit }, payload) {
		if (payload.action === 'added') commit('addJob', payload.job)
		else if (payload.action === 'finished') commit('updateJob', payload.job)
	}

}