import Vue from 'vue'
import { getDefaultState } from './index'

const objectAssignDeep = require(`object-assign-deep`);

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	setData(state, payload) {
		let setDataDeep = function(currentState, payload) {
			Object.entries(payload).forEach(([key, value]) => {
				if (typeof value === 'object' && !Array.isArray(value) && key in currentState) {
					setDataDeep(currentState[key], value)
				} else if (key in currentState) {
					Vue.set(currentState, key, value)
				}
			})
		}

		setDataDeep(state, payload)
	},

	// override special setting
	setSettings(state, data) {
		state = objectAssignDeep(state, data)
	},

	setHeaterChartVisibility(state, payload) {
		let index = state.dashboard.hiddenTempChart.indexOf(payload.name.toUpperCase())

		if (payload.hidden && index === -1) state.dashboard.hiddenTempChart.push(payload.name.toUpperCase())
		else if (payload.hidden !== true && index > -1) state.dashboard.hiddenTempChart.splice(index, 1)
	},

	setGcodefilesMetadata(state, data) {
		if (data.value && state.gcodefiles.hideMetadataColums.includes(data.name)) {
			state.gcodefiles.hideMetadataColums.splice(state.gcodefiles.hideMetadataColums.indexOf(data.name), 1)
		} else if (!data.value && !state.gcodefiles.hideMetadataColums.includes(data.name)) {
			state.gcodefiles.hideMetadataColums.push(data.name)
		}
	},

	setGcodefilesShowHiddenFiles(state, value) {
		Vue.set(state.gcodefiles, "showHiddenFiles", value)
	},

	addPreset(state, payload) {
		state.presets.push({
			name: payload.name,
			gcode: payload.gcode,
			values: payload.values
		})
	},

	updatePreset(state, payload) {
		if (state.presets[payload.index]) {
			Vue.set(state.presets[payload.index], 'name', payload.name)
			Vue.set(state.presets[payload.index], 'gcode', payload.gcode)
			Vue.set(state.presets[payload.index], 'values', payload.values)
		}
	},

	deletePreset(state, payload) {
		if (state.presets[payload.index]) {
			state.presets.splice(payload.index, 1)
		}
	},

	addWebcam(state, payload) {
		const newWebcam = {
			name: payload.name,
			icon: payload.icon,
			service: payload.service,
			targetFps: payload.targetFps,
			url: payload.url,
			flipX: payload.flipX,
			flipY: payload.flipY,
		}

		state.webcam.configs.push(newWebcam)
	},

	updateWebcam(state, payload) {
		if (state.webcam.configs[payload.index]) {
			const webcam = {...state.webcam}
			webcam.configs[payload.index] = {
				name: payload.name,
				icon: payload.icon,
				service: payload.service,
				targetFps: payload.targetFps,
				url: payload.url,
				flipX: payload.flipX,
				flipY: payload.flipY,
			}

			Vue.set(state, 'webcam', webcam)
		}
	},

	deleteWebcam(state, payload) {
		if (state.webcam.configs[payload.index]) {
			state.webcam.configs.splice(payload.index, 1)
		}
	},

	setTempchartDatasetSettings(state, payload) {
		Vue.set(state.tempchart, 'datasetSettings', payload)
	},

	setTempchartDatasetSetting(state, payload) {
		if (!(payload.name in state.tempchart.datasetSettings))
			Vue.set(state.tempchart.datasetSettings, payload.name, {})

		Vue.set(state.tempchart.datasetSettings[payload.name], payload.type, payload.value)
	},

	setTempchartDatasetAdditionalSensorSetting(state, payload) {
		if (!(payload.name in state.tempchart.datasetSettings))
			Vue.set(state.tempchart.datasetSettings, payload.name, {})

		if (!('additionalSensors' in state.tempchart.datasetSettings[payload.name]))
			Vue.set(state.tempchart.datasetSettings[payload.name], 'additionalSensors', {})

		if (!(payload.sensor in state.tempchart.datasetSettings[payload.name]['additionalSensors']))
			Vue.set(state.tempchart.datasetSettings[payload.name]['additionalSensors'], payload.sensor, {})

		Vue.set(state.tempchart.datasetSettings[payload.name]['additionalSensors'][payload.sensor], 'boolList', payload.value)
	},

	setHistoryColumns(state, data) {
		if (data.value && state.history.hideColums.includes(data.name)) {
			state.history.hideColums.splice(state.history.hideColums.indexOf(data.name), 1)
		} else if (!data.value && !state.history.hideColums.includes(data.name)) {
			state.history.hideColums.push(data.name)
		}
	},
}