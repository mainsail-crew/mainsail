import actions from './actions'
import mutations from './mutations'
import getters from './getters'

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

		},
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