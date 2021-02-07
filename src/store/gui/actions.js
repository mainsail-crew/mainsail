import axios from "axios";

export default {
	reset({ commit }) {
		commit('reset')
	},

	getData({ commit, dispatch }, payload) {
		commit('setData', payload)

		if (
			'state' in payload &&
			'tempchart' in payload.state &&
			'datasetSettings' in payload.state.tempchart
		) {
			for (const key of Object.keys(payload.state.tempchart.datasetSettings)) {
				if (
					'color' in payload.state.tempchart.datasetSettings[key] &&
					typeof payload.state.tempchart.datasetSettings[key].color === "object"
				) {
					dispatch('setTempchartDatasetSetting', { name: key, type: 'color', value: payload.state.tempchart.datasetSettings[key].color.hex })
				}
			}
		}
	},

	setSettings({ commit, dispatch }, payload) {
		commit('setSettings', payload)

		if ('tempchart' in payload && 'boolPowerDatasets' in payload.tempchart) {
			if (payload.tempchart.boolPowerDatasets) commit('printer/tempHistory/showPowerDatasets', {}, { root: true })
			else commit('printer/tempHistory/hidePowerDatasets', {}, { root: true })
		}

		dispatch('upload')
	},

	upload({ state, rootState }) {
		let file = new File([JSON.stringify({ state })], '.mainsail.json')

		let formData = new FormData();
		formData.append('file', file);
		formData.append('root', 'config');

		axios.post('//' + rootState.socket.hostname + ':' + rootState.socket.port + '/server/files/upload',
			formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
			}
		).then(() => {

		}).catch(() => {
			window.console.error("Error save .mainsail.json!")
		});
	},

	setGcodefilesMetadata({ commit, dispatch }, data) {
		commit('setGcodefilesMetadata', data)
		dispatch('upload')
	},

	setGcodefilesShowHiddenFiles({ commit, dispatch }, data) {
		commit('setGcodefilesShowHiddenFiles', data)
		dispatch('upload')
	},

	addPreset({ commit, dispatch }, payload) {
		commit("addPreset", payload)
		dispatch("upload")
	},

	updatePreset({ commit, dispatch }, payload) {
		commit("updatePreset", payload)
		dispatch("upload")
	},

	deletePreset({ commit, dispatch }, payload) {
		commit("deletePreset", payload)
		dispatch("upload")
	},

	setTempchartDatasetSetting({ commit, dispatch }, payload) {
		commit("setTempchartDatasetSetting", payload)
		dispatch("upload")
	},

	setTempchartDatasetAdditionalSensorSetting({ commit, dispatch }, payload) {
		commit("setTempchartDatasetAdditionalSensorSetting", payload)
		dispatch("upload")
	}
}