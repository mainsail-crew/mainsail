import actions from './actions'
import mutations from './mutations'
import getters from './getters'

// import modules
import power from './power'
import updateManager from './updateManager'
import history from './history'

// create getDefaultState
export function getDefaultState() {
	return {
		klippy_connected: false,
		klippy_state: "",
		klippy_message: "",
		components: [],
		failed_components: [],
		warnings: [],
		registered_directories: [],
		events: [],
		config: {},
		system_info: {
			available_services: []
		},
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
		history,
	}
}