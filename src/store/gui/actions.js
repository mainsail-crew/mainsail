import axios from "axios";
import Vue from "vue";

export default {
	reset({ commit }) {
		commit('reset')
	},

	getData({ commit, dispatch }, payload) {
		commit('setData', payload.value)
		window.console.log(payload.value)

		if (
			'tempchart' in payload.value &&
			'datasetSettings' in payload.value.tempchart
		) {
			for (const key of Object.keys(payload.value.tempchart.datasetSettings)) {
				if (
					'color' in payload.value.tempchart.datasetSettings[key] &&
					typeof payload.value.tempchart.datasetSettings[key].color === "object"
				) {
					dispatch('setTempchartDatasetSetting', { name: key, type: 'color', value: payload.value.tempchart.datasetSettings[key].color.hex })
				}
			}
		}

		dispatch('printer/init', null, { root: true })
	},

	setSettings({ commit }, payload) {
		commit('setSettings', payload)

		if ('tempchart' in payload && 'boolPowerDatasets' in payload.tempchart) {
			if (payload.tempchart.boolPowerDatasets) commit('printer/tempHistory/showPowerDatasets', {}, { root: true })
			else commit('printer/tempHistory/hidePowerDatasets', {}, { root: true })
		}

		Object.keys(payload).forEach(key => {
			Vue.prototype.$socket.sendObj('server.database.get_item', { namespace: 'mainsail' }, 'gui/updateSettings', { newVal: payload[key], keyName: key }) //, 'server/getMainsailConfig'
		})

		//dispatch('upload')
	},

	updateSettings({ commit }, payload) {
		const keyName = payload.keyName
		const newState = keyName in payload.value ? Object.assign(payload.value[keyName], payload.newVal) : payload.newVal

		Vue.prototype.$socket.sendObj('server.database.post_item', { namespace: 'mainsail', key: keyName, value: newState })

		commit('void', {}, { root: true })
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

	addPreset({ commit }, payload) {
		//commit("addPreset", payload)
		//dispatch("upload")
		window.console.log(payload)

		commit("void", {}, { root: true })
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