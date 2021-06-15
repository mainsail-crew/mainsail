import Vue from 'vue'
import { getDefaultState } from './index'
import {MutationTree} from "vuex";
import {ServerState} from "@/store/server/types";

export const mutations: MutationTree<ServerState> = {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	setKlippyDisconnected(state) {
		Vue.set(state, 'klippy_state', 'disconnected')
		Vue.set(state, 'klippy_message', 'Disconnected...')
	},

	setKlippyShutdown(state) {
		Vue.set(state, 'klippy_state', 'shutdown')
		Vue.set(state, 'klippy_message', 'Shutdown...')
	},

	setProcStats(state, payload) {
		Vue.set(state, 'cpu_temp', payload.cpu_temp)
		Vue.set(state, 'moonraker_stats', payload.moonraker_stats)
	},

	setData(state, payload) {
		if ("requestParams" in payload) delete payload.requestParams

		Object.entries(payload).forEach(([key, value]) => {
			Vue.set(state, key, value)
		})
	},

	setConfig(state, payload) {
		Object.entries(payload.config).forEach(([key, value]) => {
			Vue.set(state.config, key, value)
		})
	},

	clearGcodeStore(state) {
		Vue.set(state, 'events', [])
	},

	setGcodeStore(state, payload: any) {
		if ("gcode_store" in payload && Array.isArray(payload.gcode_store)) {
			payload.gcode_store.forEach((message: any) => {
				state.events.push({
					date: new Date(message.time * 1000),
					message: message.message,
					type: message.type
				})
			})
		}
	},

	addEvent(state, payload) {
		let message = payload
		let type = 'response'

		if (typeof payload === 'object' && 'type' in payload) type = payload.type

		if ('message' in payload) message = payload.message
		else if ('result' in payload) message = payload.result
		else if ('error' in payload) message = message.error.message

		const eventLimit = ('gcode_store_size' in state.config) ? state.config.gcode_store_size : 1000
		while (state.events.length >= eventLimit) {
			state.events.shift()
		}

		state.events.push({
			date: new Date(),
			message: message,
			type: type,
		})
	},

	setSystemInfo(state, payload) {
		Vue.set(state, 'system_info', payload)
	},

	addRootDirectory(state, payload) {
		state.registered_directories.push(payload.name)
	}
}