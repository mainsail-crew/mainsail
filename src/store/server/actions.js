import Vue from 'vue'

export default {
	reset({ commit }) {
		commit('reset')
	},

	init({ dispatch }) {
		Vue.prototype.$socket.sendObj('server.info', {}, 'server/getInfo')
		Vue.prototype.$socket.sendObj('server.gcode_store', {}, 'server/getGcodeStore')
		Vue.prototype.$socket.sendObj('server.files.get_directory', { path: 'config' }, 'files/getDirectory')
		Vue.prototype.$socket.sendObj('server.files.get_directory', { path: 'config_examples' }, 'files/getDirectory')

		dispatch('printer/init', null, { root: true })
	},

	getInfo({ commit, state }, payload) {
		if (
			payload.plugins.includes("power") !== false &&
			state.plugins.length === 0
		) Vue.prototype.$socket.sendObj('machine.device_power.devices', {}, 'server/power/getDevices');

		commit('setData', payload)

		if (!payload.klippy_connected) {
			setTimeout(function(){
				Vue.prototype.$socket.sendObj('server.info', {}, 'server/getInfo');
			}, 1000);
		}
	},

	getData({ commit }, payload){
		commit('setData', payload)
	},

	getGcodeStore({ commit }, payload) {
		commit('setGcodeStore', payload)
	},

	getGcodeRespond({commit}, data) {
		commit('addEvent', data);
	},
}