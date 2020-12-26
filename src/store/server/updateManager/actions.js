export default {
	reset({ commit }) {
		commit('reset')
	},

	getStatus({ commit }, payload) {
		commit('setStatus', payload)
	},
}