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
		for (const key of Object.keys(state.version_info)) {
			if (
				'version' in state.version_info[key] &&
				'remote_version' in state.version_info[key] &&
				state.version_info[key].version !== state.version_info[key].remote_version
			) return true
		}

		return false
	}
}