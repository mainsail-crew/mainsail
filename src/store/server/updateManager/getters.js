export default {

	getUpdateableSoftwares(state) {
		const output = {}
		const sortKeys = Object.keys(state.version_info).sort((a,b) => {
			if (a === 'klipper') return -1
			if (b === 'klipper') return 1
			if ('name' in state.version_info[a] && state.version_info[a].name === 'mainsail') return 1
			if ('name' in state.version_info[b] && state.version_info[b].name === 'mainsail') return -1
			if (a < b) return -1
			if (a > b) return 1

			return 0
		})

		for (const key of sortKeys) {
			if ('system' !== key) {
				output[key] = state.version_info[key]
			}
		}

		return output
	},

	isUpdateAvailable(state) {
		if (
			'klipper' in state &&
			'remote_hash' in state.klipper &&
			'current_hash' in state.klipper &&
			state.klipper.current_hash !== state.klipper.current_hash
		) {
			return true
		}

		return false
	}
}