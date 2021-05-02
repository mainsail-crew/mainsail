import Vue from "vue";
import objectAssignDeep from "object-assign-deep"

export default {
	reset({ commit }) {
		commit('reset')
	},

	getData({ commit, dispatch, rootState }, payload) {

		// upgrade webcam config to multi webcam support
		if ('webcam' in payload.value &&
			(
				'service' in payload.value.webcam ||
				'targetFps' in payload.value.webcam ||
				'url' in payload.value.webcam ||
				'flipX' in payload.value.webcam ||
				'flipY' in payload.value.webcam
			)
		) {
			dispatch('upgradeWebcamConfig', payload.value.webcam)
			delete payload.value.webcam
		}

		// upgrade custom console filters
		if ('console' in payload.value) {
			if (
				'customFilters' in payload.value.console &&
				typeof payload.value.console.customFilters === "string"
			) {
				dispatch('upgradeConsoleFilters', payload.value.console.customFilters)
				delete payload.value.console.customFilters
			}

			if ("boolCustomFilters" in payload.value.console) delete payload.value.console.boolCustomFilters
		}

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
		if (
			'value' in payload &&
			keyName in payload.value &&
			typeof payload.value[keyName] !== "string" &&
			!Array.isArray(payload.value[keyName])
		) {
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

	addConsoleFilter({ commit, dispatch, state }, payload) {
		commit("addConsoleFilter", payload)
		dispatch('updateSettings', {
			keyName: 'console.customFilters',
			newVal: state.console.customFilters
		})
	},

	updateConsoleFilter({ commit, dispatch, state }, payload) {
		commit("updateConsoleFilter", payload)
		dispatch('updateSettings', {
			keyName: 'console.customFilters',
			newVal: state.console.customFilters
		})
	},

	deleteConsoleFilter({ commit, dispatch, state }, payload) {
		commit("deleteConsoleFilter", payload)
		dispatch('updateSettings', {
			keyName: 'console.customFilters',
			newVal: state.console.customFilters
		})
	},

	addWebcam({ commit, dispatch, state }, payload) {
		commit("addWebcam", payload)
		dispatch('updateSettings', {
			keyName: 'webcam.configs',
			newVal: state.webcam.configs
		})
	},

	updateWebcam({ commit, dispatch, state }, payload) {
		commit("updateWebcam", payload)
		dispatch('updateSettings', {
			keyName: 'webcam.configs',
			newVal: state.webcam.configs
		})
	},

	deleteWebcam({ commit, dispatch, state }, payload) {
		commit("deleteWebcam", payload)
		dispatch('updateSettings', {
			keyName: 'webcam.configs',
			newVal: state.webcam.configs
		})
	},

	upgradeWebcamConfig({ state, dispatch }, payload) {
		const webcam = {...state.webcam}
		webcam.bool = payload.bool
		webcam.configs[0] = {
			name: 'Default',
			icon: 'mdi-webcam',
			service: 'service' in payload ? payload.service : "mjpegstreamer-adaptive",
			targetFps: 'targetFps' in payload ? payload.targetFps : 15,
			url: 'url' in payload ? payload.url : "/webcam/?action=stream",
			flipX: 'flipX' in payload ? payload.flipX : false,
			flipY: 'flipY' in payload ? payload.flipY : false,
		}

		dispatch('updateSettings', {
			keyName: 'webcam',
			newVal: webcam
		})
	},

	upgradeConsoleFilters({ state, dispatch }, payload) {
		const rules = payload.split("\n")
		if (rules.length) {
			rules.forEach((rule) => {
				if (rule !== "") {
					dispatch("addConsoleFilter", {
						name: "Custom "+(state.console.customFilters.length + 1),
						regex: rule,
						bool: true
					})
				}
			})
		}
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
	migrateMainsailJson({ state, dispatch, rootState }, payload) {
		const settings = {}

		Object.keys(payload.state).forEach(key => {
			if (key in state) {
				if (Array.isArray(payload.state[key])) settings[key] = payload.state[key]
				else settings[key] = {...payload.state[key]}
			}

			if (key === "cooldownGcode") settings["cooldown_gcode"] = payload.state[key]
			if (key === "remotePrinters") settings["remote_printers"] = payload.state[key]
		})

		if (Object.keys(settings).length) {
			dispatch('setSettings', settings)
		}

		Vue.prototype.$socket.sendObj('server.files.delete_file', { path: 'config/.mainsail.json' })

		if (!rootState.socket.remoteMode) {
			dispatch('farm/readStoredPrinters', {}, { root: true })
		}
		dispatch('printer/init', null, { root: true })
	},

	setHistoryColumns({ commit, dispatch, state }, data) {
		commit('setHistoryColumns', data)
		dispatch('updateSettings', {
			keyName: 'history',
			newVal: state.history
		})
	},
}