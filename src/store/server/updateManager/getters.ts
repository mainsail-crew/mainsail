import {GetterTree} from "vuex"
import {ServerUpdateMangerState} from "@/store/server/updateManager/types"
import semver from "semver"

export const getters: GetterTree<ServerUpdateMangerState, any> = {
	getUpdateableSoftwares(state) {
		const output: any = {}
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
				semver.valid(state.version_info[key].version) &&
				semver.valid(state.version_info[key].remote_version) &&
				semver.gt(state.version_info[key].remote_version, state.version_info[key].version)
			) return true
		}

		return false
	}
}