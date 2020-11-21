import Vue from 'vue'

export default {
	reset({ commit }) {
		commit('reset')
	},

	init() {
		Vue.prototype.$socket.sendObj('server.info', {}, 'server/getInfo')
		Vue.prototype.$socket.sendObj('server.gcode_store', {}, 'server/getGcodeStore')
		//Vue.prototype.$socket.sendObj('server.files.get_directory', { path: '/config' }, 'getDirectoryRoot')
	},

	getInfo({ commit, dispatch }, payload) {
		commit('setData', payload)

		if (payload.klippy_connected) {
			Vue.prototype.$socket.sendObj('server.files.get_directory', { path: 'config' }, 'files/getDirectory');
			Vue.prototype.$socket.sendObj('server.files.get_directory', { path: 'config_examples' }, 'files/getDirectory');

			if (payload.plugins.includes("power") !== false) Vue.prototype.$socket.sendObj('machine.device_power.devices', {}, 'server/power/getDevices');

			dispatch('printer/init', null, { root: true });
		} else {
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