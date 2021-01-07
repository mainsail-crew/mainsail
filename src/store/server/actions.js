import Vue from 'vue'

export default {
	reset({ commit }) {
		commit('reset')
	},

	init({ dispatch, state }) {
		Vue.prototype.$socket.sendObj('server.info', {}, 'server/getInfo')
		Vue.prototype.$socket.sendObj('server.gcode_store', {}, 'server/getGcodeStore')
		Vue.prototype.$socket.sendObj('server.files.get_directory', { path: 'config' }, 'files/getDirectory')
		Vue.prototype.$socket.sendObj('server.files.get_directory', { path: 'config_examples' }, 'files/getDirectory')

		if (state.plugins.length > 0 && state.plugins.includes("update_manager"))
			Vue.prototype.$socket.sendObj('machine.update.status', { refresh: false }, 'server/updateManager/getStatus')

		dispatch('printer/init', null, { root: true })
	},

	getInfo({ commit, state }, payload) {

		if (state.plugins.length === 0) {
			if (payload.plugins.includes("power") !== false)
				Vue.prototype.$socket.sendObj('machine.device_power.devices', {}, 'server/power/getDevices')

			if (payload.plugins.includes("update_manager") !== false)
				Vue.prototype.$socket.sendObj('machine.update.status', {}, 'server/updateManager/getStatus')
		}

		commit('setData', payload)

		if (!payload.klippy_connected) {
			setTimeout(function(){
				Vue.prototype.$socket.sendObj('server.info', {}, 'server/getInfo')
			}, 1000)
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