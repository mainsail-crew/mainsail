import { getDefaultState } from './index'

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	addJob(state, payload) {
		state.jobs.push(payload)
	},

	updateJob(state, payload) {
		const index = state.jobs.findIndex(job => job.job_id === payload.job_id)
		if (index !== -1) {
			state.jobs[index] = payload
		}
	}
}