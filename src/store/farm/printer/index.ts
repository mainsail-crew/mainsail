import {FarmPrinterState} from "@/store/farm/printer/types"
import { getDefaultState as getGuiDefaultState } from '@/store/gui/index'
import { actions } from '@/store/farm/printer/actions'
import { mutations } from '@/store/farm/printer/mutations'
import { getters } from '@/store/farm/printer/getters'
import {Module} from "vuex";

export const getDefaultState = (): FarmPrinterState => {
	return {
		_namespace: "",
		socket: {
			instance: null,
			hostname: "",
			port: 7125,
			webPort: 80,
			protocol: 'ws',
			isConnected: false,
			isConnecting: false,
			reconnects: 0,
			maxReconnects: 2,
			reconnectInterval: 1000,
			wsData: [],
		},
		data: {
			gui: getGuiDefaultState()
		},
		settings: {

		},
		databases: [],
		current_file: {
			isDirectory: false,
			filename: "",
			modified: new Date()
		},
		theme_files: []
	}
}

// initial state
const state = () => {
	return getDefaultState()
}

export const printer: Module<FarmPrinterState, any> = {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}