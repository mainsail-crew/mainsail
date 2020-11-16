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

			Vue.prototype.$socket.sendObj('machine.gpio_power.status', {}, 'server.powerDevices.getStatus');
		}
	},

	getStatus({ commit }, payload) {
		if (payload.error) {
			Vue.$toast.error(payload.error.message);
		} else commit('setStatus', payload);
	},
}