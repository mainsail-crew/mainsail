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
		Vue.prototype.$socket.sendObj('server.database.list', { root: 'config' }, 'server/checkDatabases')
	},

	checkDatabases({ commit }, payload) {
		if (
			'namespaces' in payload &&
			payload.namespaces.includes('mainsail')
		) {
			Vue.prototype.$socket.sendObj('server.database.get_item', { namespace: 'mainsail' }, 'gui/getData')
		} else {
			//fallback for a short time...
			Vue.prototype.$socket.sendObj('server.files.list', { root: 'config' }, 'server/checkMainsailJson')

			//after this short migration time...
			//dispatch('printer/init', null, { root: true })
			commit('void', { }, { root: true })
		}
	},

	checkMainsailJson({ dispatch, rootState }, payload) {
		let boolFallback = true

		Object.entries(payload).forEach(([, file]) => {
			if ('filename' in file && file.filename === '.mainsail.json') {
				boolFallback = false

				fetch('//'+rootState.socket.hostname+':'+rootState.socket.port+'/server/files/config/.mainsail.json?time='+Date.now())
					.then(res => res.json()).then(file => {
					dispatch('gui/migrateMainsailJson', file, { root: true })
				})
			}
		})

		if (boolFallback) dispatch('printer/init', null, { root: true })
	},

	getInfo({ commit, state, rootState }, payload) {
		if (state.components.length === 0) {
			//reverse compatibility
			let components = ('components' in payload) ? payload.components : []
			if (components.length === 0 && 'plugins' in payload)  components = payload.plugins

			if (components.includes("power") !== false)
				Vue.prototype.$socket.sendObj('machine.device_power.devices', {}, 'server/power/getDevices')

			if (components.includes("update_manager") !== false)
				Vue.prototype.$socket.sendObj('machine.update.status', {}, 'server/updateManager/getStatus')

			if (payload.plugins.includes("history") !== false) {
				Vue.prototype.$socket.sendObj('server.history.list', {}, 'server/history/getHistory')
				Vue.prototype.$socket.sendObj('server.history.totals', {}, 'server/history/getTotals')
			}
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