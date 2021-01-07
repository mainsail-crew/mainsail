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
					send: false
				})
			})
		}
	},

	addEvent(state, payload) {
		let message = payload
		let send = true

		if (typeof payload === 'object' && 'send' in payload) send = payload.send

		if (message.result !== undefined) message = message.result
		else if (message.error !== undefined) message = message.error.message

		state.events.push({
			date: new Date(),
			message: message,
			send: send,
		})
	},
}