import Vue from 'vue'
import { getDefaultStore } from './index'

export default {
	reset(state) {
		Object.assign(state, getDefaultStore)
	},

	setDevices(state, payload) {
		Vue.set(state, 'devices', payload)
	},

	setPStatus(state, payload) {
		for (let key in payload) {
			let devIdx = state.devices.findIndex(device => device.id === key)
			if (devIdx >= 0)  Vue.set(state.devices[devIdx], 'status', payload[key] === 'off' ? 0 : 1)
		}
	},
}