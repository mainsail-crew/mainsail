import Vue from 'vue'
import { getDefaultState } from './index'

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	setKlippyReady() {
		this.dispatch('printer/reset', null, { root: true })
		this.dispatch('printer/init', null, { root: true })
	},

	setKlippyDisconnected(state) {
		Vue.set(state, 'klippy_state', 'disconnected')
		Vue.set(state, 'klippy_message', 'Disconnected...')

		Vue.prototype.$socket.sendObj('server.info', {}, 'server/getInfo');
	},

	setKlippyShutdown(state) {
		Vue.set(state, 'klippy_state', 'shutdown')
		Vue.set(state, 'klippy_message', 'Shutdown...')

		Vue.prototype.$socket.sendObj('server.info', {}, 'server/getInfo');
	},

	setData(state, payload) {
		if ("requestParams" in payload) delete payload.requestParams

		Object.entries(payload).forEach(([key, value]) => {
			Vue.set(state, key, value)
		});
	},

	setConfig(state, payload) {
		Object.entries(payload.config).forEach(([key, value]) => {
			Vue.set(state.config, key, value)
		})
	},

	clearGcodeStore(state) {
		Vue.set(state, 'events', [])
	},

	setGcodeStore(state, payload) {
		if ("gcode_store" in payload && Array.isArray(payload.gcode_store)) {
			payload.gcode_store.forEach(message => {
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

	addRootDirectory(state, payload) {
		state.registered_directories.push(payload.name)
	}
}