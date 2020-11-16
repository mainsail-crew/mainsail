import actions from './actions'
import mutations from './mutations'
import getters from './getters'

// import modules
import powerDevices from './powerDevices'

const getDefaultState = () => {
	return {
		klippy_connected: false,
		klippy_state: "",
		klippy_message: "",
		plugins: [],
		events: [],
	}
}

// initial state
const state = getDefaultState()

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
	modules: {
		powerDevices
	}
}