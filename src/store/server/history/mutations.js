import { getDefaultState } from './index'

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	addJob(state, payload) {
		state.jobs.push(payload)
	}
}