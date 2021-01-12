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

	setData(state, payload) {
		if ("requestParams" in payload) delete payload.requestParams

		Object.entries(payload).forEach(([key, value]) => {
			Vue.set(state, key, value)
		});
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

		state.events.push({
			date: new Date(),
			message: message,
			type: type,
		})
	},
}