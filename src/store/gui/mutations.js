import Vue from 'vue'
import { getDefaultStore } from './index'

const objectAssignDeep = require(`object-assign-deep`);

export default {
	reset(state) {
		Object.assign(state, getDefaultStore)
	},

	setData(state, payload) {
		if ("state" in payload) payload = payload.state
		if ("gui" in payload) payload = payload.gui

		Object.entries(payload).forEach(([key, value]) => {
			Vue.set(state, key, value)
		})
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
		Vue.set(state.gcodefiles.showMetadata, data.name, data.value)
	},


	setGcodefilesShowHiddenFiles(state, value) {
		Vue.set(state.gcodefiles, "showHiddenFiles", value)
	},
}