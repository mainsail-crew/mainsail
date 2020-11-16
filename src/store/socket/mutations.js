import Vue from 'vue'
import { getDefaultStore } from './index'

export default {
	reset(state) {
		Object.assign(state, getDefaultStore)
	},

	setConnected (state) {
		state.isConnected = true;
	},

	setDisconnected (state) {
		state.isConnected = false;
	},

	setData(state, payload) {
		if ("socket" in payload) payload = payload.socket

		Object.entries(payload).forEach(([key, value]) => {
			Vue.set(state, key, value)
		});
	}
}