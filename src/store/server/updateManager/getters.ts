import {GetterTree} from 'vuex'
import {
    ServerUpdateMangerState
} from '@/store/server/updateManager/types'
import semver from 'semver'

// eslint-disable-next-line
export const getters: GetterTree<ServerUpdateMangerState, any> = {
    getUpdateableSoftwares(state) {
        // eslint-disable-next-line
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
        const keys = Object.keys(state.version_info).filter((key: string) => key !== 'system')

        for (const key of keys) {
            const versionInfo = state.version_info[key]

            if (
                'version' in versionInfo &&
				'remote_version' in versionInfo &&
				semver.valid(versionInfo.version) &&
				semver.valid(versionInfo.remote_version) &&
				semver.gt(versionInfo.remote_version, versionInfo.version)
            ) return true
        }

        return false
    }
}