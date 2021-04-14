import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import { getDefaultState as getGuiDefaultState } from '../../gui/index'

export function getDefaultState() {
	return {
		_namespace: "",
		socket: {
			instance: null,
			hostname: "",
			port: 7125,
			webPort: 80,
			protocol: 'ws',
			isConnected: false,
			isConnecting: false,
			reconnects: 0,
			maxReconnects: 2,
			reconnectInterval: 1000,
			wsData: [],
		},
		data: {
			gui: getGuiDefaultState()
		},
		databases: [],
		current_file: {},
		theme_files: []
	}
}

// initial state
const state = () => {
	return getDefaultState()
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}