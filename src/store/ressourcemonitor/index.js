import actions from './actions'
import mutations from './mutations'
import getters from './getters'

// import modules
import ramHistory from './ramHistory'
import cpuTempHistory from './cpuTempHistory'
import cpuLoadHistory from './cpuLoadHistory'
import cpuFreqHistory from './cpuFreqHistory'

export function getDefaultState() {
	return {
		cpu: {
			colors: [],
			vendor: "",
			brand: "",
			socket: "",
			cores: 0,
			threads: 0,
			freqcores: [],
			freqmin: 0.0,
			freqmax: 0.0,
			temp: 0.0,
			temps: [],
			load: 0,
			loads: [],
		},
		ram: {
			total: 0.0,
			used: 0.0,
			totalswap: 0.0,
			usedswap: 0.0,
			modules: [],
		}
	}
}


// initial state
const state = getDefaultState()

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
	modules: {
		ramHistory,
		cpuLoadHistory,
		cpuFreqHistory,
		cpuTempHistory
	}
}