import actions from './actions'
import mutations from './mutations'
import getters from './getters'

// import modules
import ramHistory from './ramHistory'
import cpuTempHistory from './cpuTempHistory'
import cpuLoadHistory from './cpuLoadHistory'
import cpuFreqHistory from './cpuFreqHistory'
import gpuCoreFreqHistory from './gpuCoreFreqHistory'
import gpuMemFreqHistory from './gpuMemFreqHistory'
import gpuTempHistory from './gpuTempHistory'
import gpuCoreHistory from './gpuCoreHistory'
import gpuMemHistory from './gpuMemHistory'
import networkTransmitHistory from './networkTransmitHistory'
import networkReceiveHistory from './networkReceiveHistory'
import filesystemPartitionUsageHistory from './filesystemPartitionUsageHistory'

export function getDefaultState() {
	return {
		system: [],
		bios: [],
		chassis: [],
		mainboard: [],
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
		},
		gpu: {
			cards: [],
			colors: []
		},
		screens: [],
		network: {
			colors: [],
			interfaces: []
		},
		filesystem: {
			disks: [],
			partitions: []
		},
		os: ""
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
		cpuTempHistory,
		gpuCoreFreqHistory,
		gpuMemFreqHistory,
		gpuTempHistory,
		gpuCoreHistory,
		gpuMemHistory,
		networkTransmitHistory,
		networkReceiveHistory,
		filesystemPartitionUsageHistory
	}
}