import actions from './actions'
import mutations from './mutations'
import getters from './getters'

const getDefaultState = () => {
	return {
		hostname: window.location.hostname,
		port: window.location.port,
		reconnectInterval: 5000,
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