import Vue from 'vue'

export default {
	reset({ commit, dispatch }) {
		commit('reset')
		dispatch('power/reset')
		dispatch('updateManager/reset')
	},

	init() {
		Vue.prototype.$socket.sendObj('server.info', {}, 'server/getInfo')
		Vue.prototype.$socket.sendObj('server.config', {}, 'server/getConfig')
		Vue.prototype.$socket.sendObj('server.files.list', { root: 'config' }, 'server/checkMainsailJson')
	},

	checkMainsailJson({ dispatch, rootState }, payload) {
		let boolFallback = true

		Object.entries(payload).forEach(([, file]) => {
			if ('filename' in file && file.filename === '.mainsail.json') {
				boolFallback = false

				fetch('//'+rootState.socket.hostname+':'+rootState.socket.port+'/server/files/config/.mainsail.json?time='+Date.now())
					.then(res => res.json()).then(file => {
					dispatch('gui/getData', file, { root: true })
					if (!rootState.socket.remoteMode) dispatch('farm/readStoredPrinters', {}, { root: true })
					dispatch('printer/init', null, { root: true })
				})
			}
		})

		if (boolFallback) dispatch('printer/init', null, { root: true })
	},

	getInfo({ commit, state, rootState }, payload) {
		if (state.plugins.length === 0) {
			if (payload.plugins.includes("power") !== false)
				Vue.prototype.$socket.sendObj('machine.device_power.devices', {}, 'server/power/getDevices')

			if (payload.plugins.includes("update_manager") !== false)
				Vue.prototype.$socket.sendObj('machine.update.status', {}, 'server/updateManager/getStatus')
		}

		if (state.registered_directories.length === 0 && 'registered_directories' in payload) {
			for (const directory of payload.registered_directories) {
				if (rootState.files.filetree.findIndex((element) => element.isDirectory && element.filename === directory) !== -1) {
					Vue.prototype.$socket.sendObj('server.files.get_directory', { path: directory }, 'files/getDirectory')
				}
			}
		}

		commit('setData', payload)

		if (!payload.klippy_connected || payload.klippy_state === "startup") {
			setTimeout(function(){
				Vue.prototype.$socket.sendObj('server.info', {}, 'server/getInfo')
				Vue.prototype.$socket.sendObj('printer.info', {}, 'printer/getStateMessage')
			}, 1000)
		}
	},

	getConfig({ commit }, payload) {
		commit('setConfig', payload)

		Vue.prototype.$socket.sendObj('server.gcode_store', {}, 'server/getGcodeStore')
	},

	getData({ commit }, payload){
		commit('setData', payload)
	},

	getGcodeStore({ commit }, payload) {
		commit('clearGcodeStore')
		commit('setGcodeStore', payload)
	},

	getGcodeRespond({commit}, data) {
		commit('addEvent', data);
	},
}