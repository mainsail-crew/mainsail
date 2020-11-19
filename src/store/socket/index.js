import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export function getDefaultState() {
	return {
		hostname: process.env.VUE_APP_HOSTNAME || window.location.hostname,
		port: process.env.VUE_APP_PORT || window.location.port,
		reconnectInterval: process.env.VUE_APP_RECONNECT_INTERVAL || 5000,
		isConnected: false,

		loadings: []
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