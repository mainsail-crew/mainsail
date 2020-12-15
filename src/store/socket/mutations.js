import Vue from 'vue'
import { getDefaultState } from './index'

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
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
	},

	addLoading(state, payload) {
		state.loadings.push(payload.name)
	},

	removeLoading(state, payload) {
		const index = state.loadings.indexOf(payload.name);
		if (index > -1) {
			state.loadings.splice(index, 1);
		}
	},

	clearLoadings(state) {
		if(state.loadings.length) state.loadings.splice(0, state.loadings.length)
	}
}