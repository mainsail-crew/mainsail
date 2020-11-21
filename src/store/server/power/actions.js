import Vue from 'vue'

export default {
	reset({ commit }) {
		commit('reset')
	},

	getDevices({ commit }, payload) {
		if (payload.error) {
			Vue.$toast.error(payload.error.message);
		} else {
			commit('setDevices', payload.devices);
		}
	},

	getStatus({ commit }, payload) {
		if (payload.error) {
			Vue.$toast.error(payload.error.message);
		} else commit('setStatus', payload);
	},

	responseToggle({ commit }, payload) {
		if ('requestParams' in payload) delete payload.requestParams

		for (const [key, value] of Object.entries(payload)) {
			commit('setStatus', { device: key, status: value })
		}
	}
}