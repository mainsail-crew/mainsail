import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export function getDefaultState() {
	return {
		moonraker: {},
		klipper: {},
		client: {},
		updateResponse: {
			application: "",
			complete: true,
			messages: [],
		}
	}
}

// initial state
const state = getDefaultState()

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}