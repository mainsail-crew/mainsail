import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export function getDefaultState() {
	return {
		remoteMode: process.env.VUE_APP_REMOTE_MODE === "true" || (document.location.hostname === "my.mainsail.xyz"),
		hostname: process.env.VUE_APP_HOSTNAME || (process.env.VUE_APP_REMOTE_MODE === "true" || document.location.hostname === "my.mainsail.xyz" ? "" : window.location.hostname),
		port: process.env.VUE_APP_PORT || (process.env.VUE_APP_REMOTE_MODE === "true" || document.location.hostname === "my.mainsail.xyz" ? 7125 : window.location.port),
		protocol: document.location.protocol === 'https:' ? 'wss' : 'ws',
		reconnectInterval: process.env.VUE_APP_RECONNECT_INTERVAL || 2000,
		isConnected: false,
		isConnecting: false,
		connectingFailed: false,

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