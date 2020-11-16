import actions from './actions'
import mutations from './mutations'
import getters from './getters'

const getDefaultState = () => {
	return {
		datasets: [],
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