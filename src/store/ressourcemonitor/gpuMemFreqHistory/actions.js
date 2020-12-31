export default {
	reset({ commit }) {
		commit('reset')
	},

	getHistory({ commit }, payload) {
		commit('setHistory', payload);
	},
}