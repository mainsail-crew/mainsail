import { getDefaultState } from './index'
import Vue from "vue";

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	resetJobs(state) {
		Vue.set(state, 'jobs', [])
	},

	setTotals(state, payload) {
		Vue.set(state, 'job_totals', payload)
	},

	addJob(state, payload) {
		state.jobs.push(payload)
	},

	updateJob(state, payload) {
		const index = state.jobs.findIndex(job => job.job_id === payload.job_id)
		if (index !== -1) {
			Vue.set(state.jobs, index, payload)
		}
	},

	destroyJob(state, payload) {
		const index = state.jobs.findIndex(job => job.job_id === payload)
		if (index !== -1) {
			state.jobs.splice(index,1)
		}
	}
}