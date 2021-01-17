import axios from "axios";

export default {
	reset({ commit }) {
		commit('reset')
	},

	getData({ commit }, payload) {
		commit('setData', payload)
	},

	setSettings({ commit, dispatch }, payload) {
		commit('setSettings', payload)
		dispatch('upload')
	},

	upload({ state, rootState }) {
		let file = new File([JSON.stringify({ state })], '.mainsail.json');

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
	}
}