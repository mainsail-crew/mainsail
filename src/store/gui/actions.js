import Vue from "vue";
import objectAssignDeep from "object-assign-deep"

export default {
	reset({ commit }) {
		commit('reset')
	},

	getData({ commit, dispatch, rootState }, payload) {
		let oldwebcamconfig = payload.value.webcam

		commit('setData', payload.value)

		if (typeof (oldwebcamconfig) !== "undefined") {
			dispatch('convertCamConfig', oldwebcamconfig)
		}

		if ('tempchart' in payload.value && 'datasetSettings' in payload.value.tempchart) {
			commit('setTempchartDatasetSettings', payload.value.tempchart.datasetSettings)
		}

		if (!rootState.socket.remoteMode) {
			dispatch('farm/readStoredPrinters', {}, { root: true })
		}

		dispatch('printer/init', null, { root: true })
	},

	convertCamConfig({ dispatch }, payload) {

		if (typeof (payload.configs) !== "undefined") {
			return
		}

		let oldcamconfig = {
			name: "Default",
			icon: "mdi-webcam",
			config: {
				service: "mjpegstreamer",
				targetFps: 25,
				url: "/webcam/?action=stream",
				flipX: false,
				flipY: false,
			},
		}

		let cleanupconfig = {
			service: undefined,
			targetFps: undefined,
			url: undefined,
			flipX: undefined,
			flipY: undefined,
			rotate: undefined,
			rotateDegrees: undefined,
			selectedCam: 'Default',
			bool: payload.bool,
			configs: [],
		}

		if (typeof (payload.url) !== "undefined") {
			oldcamconfig.config.url = payload.url
		}
		if (typeof (payload.service) !== "undefined") {
			oldcamconfig.config.service = payload.service
		}
		oldcamconfig.config.targetFps = payload.targetFps
		oldcamconfig.config.flipX = payload.flipX
		oldcamconfig.config.flipY = payload.flipY
		
		cleanupconfig.configs.push(oldcamconfig)

		dispatch('setSettings', { 'webcam': cleanupconfig })
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