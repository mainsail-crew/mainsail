import Vue from 'vue'
import { getDefaultState } from './index'
import {MutationTree} from "vuex";
import {ServerState} from "@/store/server/types";
import {formatConsoleMessage, formatTime} from "@/plugins/helpers";
import {maxEventHistory} from "@/store/variables";

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
		//const t0 = performance.now()

		if (payload.length >= maxEventHistory) {
			payload = payload.slice(payload.length - maxEventHistory);
		}

		payload.forEach((message: any) => {
			const date = new Date(message.time * 1000)
			let formatMessage = formatConsoleMessage(message.message)

			if (message.type === 'command') formatMessage = '<a class="command text--blue">'+formatMessage+"</a>"

			state.events.push({
				date: date,
				formatTime: formatTime(date),
				message: message.message,
				formatMessage: formatMessage,
				type: message.type
			})
		})

		//const t1 = performance.now()
		//window.console.debug("import events", t1-t0)
	},

	addEvent(state, payload) {

		if (['command', 'autocomplete'].includes(payload.type) && state.events[state.events.length - 1]?.type === 'autocomplete') {
			state.events.pop();
		}

		state.events.push({
			date: payload.date,
			formatTime: formatTime(payload.date),
			message: payload.message,
			formatMessage: payload.formatMessage,
			type: payload.type,
		})

		if (state.events.length >= maxEventHistory) {
			state.events = state.events.slice(state.events.length - maxEventHistory);
		}
	},

	setSystemInfo(state, payload) {
		Vue.set(state, 'system_info', payload)
	},

	setThrottledState(state, payload) {
		if ('bits' in payload)
			Vue.set(state.throttled_state, 'bits', payload.bits)

		if ('flags' in payload)
			Vue.set(state.throttled_state, 'flags', payload.flags)
	},

	addRootDirectory(state, payload) {
		state.registered_directories.push(payload.name)
	}
}
