import Vue from "vue";
import objectAssignDeep from "object-assign-deep"

export default {
	reset({ commit }) {
		commit('reset')
	},

	getData({ commit, dispatch, rootState }, payload) {
		commit('setData', payload.value)

		if ('tempchart' in payload.value && 'datasetSettings' in payload.value.tempchart) {
			commit('setTempchartDatasetSettings', payload.value.tempchart.datasetSettings)
		}

		if (!rootState.socket.remoteMode) {
			dispatch('farm/readStoredPrinters', {}, { root: true })
		}

		dispatch('printer/init', null, { root: true })
	},

	setSettings({ commit }, payload) {
		commit('setSettings', payload)

		Object.keys(payload).forEach(key => {
			Vue.prototype.$socket.sendObj('server.database.get_item', { namespace: 'mainsail' }, 'gui/updateSettings', { newVal: payload[key], keyName: key })
		})
	},

	updateSettings({ commit }, payload) {
		const keyName = payload.keyName
		let newState = payload.newVal
		if ('value' in payload && keyName in payload.value) {
			newState = objectAssignDeep(payload.value[keyName], newState)
		}

		Vue.prototype.$socket.sendObj('server.database.post_item', { namespace: 'mainsail', key: keyName, value: newState })

		commit('void', {}, { root: true })
	},

	setGcodefilesMetadata({ commit, dispatch, state }, data) {
		commit('setGcodefilesMetadata', data)
		dispatch('updateSettings', {
			keyName: 'gcodefiles',
			newVal: state.gcodefiles
		})
	},

	setGcodefilesShowHiddenFiles({ commit, dispatch, state }, data) {
		commit('setGcodefilesShowHiddenFiles', data)
		dispatch('updateSettings', {
			keyName: 'gcodefiles',
			newVal: state.gcodefiles
		})
	},

	addPreset({ commit, dispatch, state }, payload) {
		commit("addPreset", payload)
		dispatch('updateSettings', {
			keyName: 'presets',
			newVal: state.presets
		})
	},

	updatePreset({ commit, dispatch, state }, payload) {
		commit("updatePreset", payload)
		dispatch('updateSettings', {
			keyName: 'presets',
			newVal: state.presets
		})
	},

	deletePreset({ commit, dispatch, state }, payload) {
		commit("deletePreset", payload)
		dispatch('updateSettings', {
			keyName: 'presets',
			newVal: state.presets
		})
	},

	setTempchartDatasetSetting({ commit, dispatch, state }, payload) {
		commit("setTempchartDatasetSetting", payload)
		dispatch('updateSettings', {
			keyName: 'tempchart',
			newVal: state.tempchart
		})
	},

	setTempchartDatasetAdditionalSensorSetting({ commit, dispatch, state }, payload) {
		commit("setTempchartDatasetAdditionalSensorSetting", payload)
		dispatch('updateSettings', {
			keyName: 'tempchart',
			newVal: state.tempchart
		})
	},

	resetMoonrakerDB() {
		Vue.prototype.$socket.sendObj('server.database.list', { }, 'gui/resetMoonrakerDB2')
	},

	resetMoonrakerDB2({ commit }, payload) {
		if ('namespaces' in payload && payload.namespaces.includes('mainsail')) {
			Vue.prototype.$socket.sendObj('server.database.get_item', { namespace: 'mainsail' }, 'gui/resetMoonrakerDB3')
		}

		commit('void', {}, { root: true })
	},

	resetMoonrakerDB3({ commit }, payload) {
		if ('value' in payload && Object.keys(payload.value).length) {
			Object.keys(payload.value).forEach(key => {
				Vue.prototype.$socket.sendObj('server.database.delete_item', { namespace: 'mainsail', key: key })
			})

			window.location.reload()
		}

		commit('void', {}, { root: true })
	},

	//TODO: remove it after a short time of migration. maybe april release
	migrateMainsailJson({ state, dispatch }, payload) {
		const settings = {}

		Object.keys(payload.state).forEach(key => {
			if (key in state) {
				settings[key] = {...payload.state[key]}
			}

			if (key === "cooldownGcode") settings["cooldown_gcode"] = payload.state[key]
			if (key === "remotePrinters") settings["remote_printers"] = {...payload.state[key]}
		})

		if (Object.keys(settings).length) {
			dispatch('setSettings', settings)
		}

		Vue.prototype.$socket.sendObj('server.files.delete_file', { path: 'config/.mainsail.json' })
		dispatch('printer/init', null, { root: true })
	}
}