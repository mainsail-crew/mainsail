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
		let file = new File([JSON.stringify({ state })], 'gui.json');

		let formData = new FormData();
		formData.append('file', file);
		formData.append('root', 'config');

		axios.post('//' + rootState.socket.hostname + ':' + rootState.socket.port + '/server/files/upload',
			formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
			}
		).then(() => {
			window.console.info("gui.json successfully uploaded")
		}).catch(() => {
			window.console.error("Error save gui.json!")
		});
	},
}