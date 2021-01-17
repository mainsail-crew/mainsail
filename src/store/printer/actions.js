import Vue from 'vue'

export default {
	reset({ commit }) {
		commit('reset')
		commit('tempHistory/reset')
	},

	init() {
		Vue.prototype.$socket.sendObj('printer.info', {}, 'printer/getInfo')

		// only available with klipper is ready
		Vue.prototype.$socket.sendObj('server.files.get_directory', { path: 'gcodes' }, 'files/getDirectory')
	},

	getInfo({ commit }, payload) {
		commit('server/setData', {
			klippy_state: payload.state,
			klippy_message: payload.state_message,
		}, { root: true })

		commit('setData', {
			hostname: payload.hostname,
			software_version: payload.software_version,
			cpu_info: payload.cpu_info,
		})

		Vue.prototype.$socket.sendObj('printer.objects.list', {}, 'printer/getObjectsList')
		Vue.prototype.$socket.sendObj('printer.gcode.help', {}, 'printer/getHelpList')
	},

	getStateMessage({ commit }, payload) {
		commit('server/setData', {
			klippy_message: payload.state_message,
		}, { root: true })
	},

	getObjectsList({ commit }, payload) {
		let subscripts = {}
		const blocklist = [
			"gcode_macro",
			"menu",
		];

		for (let key of payload.objects) {
			let nameSplit = key.split(" ");

			if (!blocklist.includes(nameSplit[0])) subscripts = {...subscripts, [key]: null }
		}

		if (subscripts !== {}) Vue.prototype.$socket.sendObj('printer.objects.subscribe', { objects: subscripts }, "printer/getData")
		Vue.prototype.$socket.sendObj("server.temperature_store", {}, "printer/tempHistory/getHistory")

		commit('void', null, { root: true })
	},

	getData({ commit }, payload) {
		commit('setData', payload)
	},

	getHelpList({ commit }, payload) {
		commit('setHelplist', payload)
	},

	getEndstopStatus({ commit }, payload) {
		commit('socket/removeLoading', { name: 'queryEndstops' }, { root: true });
		commit('setEndstopStatus', payload);
	},

	removeBedMeshProfile({ commit }, payload) {
		commit('socket/removeLoading', { name: 'bedMeshRemove_'+payload.name }, { root: true })
		commit('removeBedMeshProfile', payload)
	}
}