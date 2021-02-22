import actions from './actions'
import mutations from './mutations'
import getters from './getters'

// import modules
import power from './power'
import updateManager from './updateManager'

// create getDefaultState
export function getDefaultState() {
	return {
		klippy_connected: false,
		klippy_state: "",
		klippy_message: "",
		plugins: [],
		failed_plugins: [],
		registered_directories: [],
		events: [],
		config: {},
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
		power,
		updateManager,
	}
}