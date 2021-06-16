import { Module } from "vuex"
import { ServerState } from "@/store/server/types"
import { actions } from '@/store/server/actions'
import { mutations } from '@/store/server/mutations'
import { getters } from '@/store/server/getters'

// import modules
import { power } from '@/store/server/power'
import { updateManager } from '@/store/server/updateManager'
import { history } from '@/store/server/history'

// create getDefaultState
export const getDefaultState = (): ServerState => {
	return {
		klippy_connected: false,
		klippy_state: "",
		klippy_message: "",
		components: [],
		failed_components: [],
		warnings: [],
		registered_directories: [],
		events: [],
		config: { },
		system_info: { },
		cpu_temp: 0,
		moonraker_stats: { }
	}
}

// initial state
const state = getDefaultState()

export const server: Module<ServerState, any> = {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
	modules: {
		power,
		updateManager,
		history,
	}
}