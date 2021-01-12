export default {

	getKlipperBranch(state) {
		if (
			'klipper' in state &&
			'branch' in state.klipper &&
			'remote_alias' in state.klipper
		) return state.klipper.remote_alias+"/"+state.klipper.branch

		return "UNKNOWN"
	},

	getMoonrakerBranch(state) {
		if (
			'moonraker' in state &&
			'branch' in state.moonraker &&
			'remote_alias' in state.moonraker
		) return state.moonraker.remote_alias+"/"+state.moonraker.branch

		return "UNKNOWN"
	}
}