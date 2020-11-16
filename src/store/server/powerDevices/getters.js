export default {
	devices: state => {
		return state.devices;
	},

	count: (state, getters) => {
		return getters.devices.length;
	},
}