import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export function getDefaultState() {
	return {
		moonraker: {},
		klipper: {},
		client: {},
		system: {
			package_count: 0,
			package_list: []
		},
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