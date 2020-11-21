import Vue from 'vue'
import { getDefaultState } from './index'

export default {
	reset(state) {
		Object.assign(state, getDefaultState)
	},

	setDevices(state, payload) {
		Vue.set(state, 'devices', payload)
	},

	setStatus(state, payload) {
		let devIdx = state.devices.findIndex(device => device.device === payload.device)
		if (devIdx >= 0) Vue.set(state.devices[devIdx], 'status', payload.status)
	},
}