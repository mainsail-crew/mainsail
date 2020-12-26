import Vue from 'vue'
import { getDefaultState } from './index'

export default {
	reset(state) {
		Object.assign(state, getDefaultState())

		this.dispatch('socket/clearLoadings', null, { root: true })
		if (this.state.server.plugins.includes("update_manager"))
			Vue.prototype.$socket.sendObj('machine.update.status', { refresh: false }, 'server/updateManager/getStatus')
	},

	setData(state, payload) {
		if ("status" in payload) payload = payload.status;
		if ("requestParams" in payload) delete payload.requestParams
		let now = Date.now();

		Object.entries(payload).forEach(([key, value]) => {
			if (key === "webhooks") {
				this.dispatch("server/getData", { klippy_state: value.state, klippy_message: value.state_message }, { root: true })
			} else {
				//update printer data
				if (typeof (value) === "object") {
					Vue.set(state, key, {
						...state[key],
						...value
					})
				} else Vue.set(state, key, value)

				//update heaters
				if (
					Array.isArray(state.heaters.available_heaters) &&
					state.heaters.available_heaters.length
				) {
					let keySplit = key.split(" ")

					if (
						state.heaters.available_heaters.includes(key) ||
						keySplit[0] === "temperature_fan" ||
						keySplit[0] === "temperature_sensor") {

						let name = keySplit[0]
						if (keySplit[0] === "temperature_fan") name = keySplit[1]
						else if (keySplit[0] === "temperature_sensor") name = keySplit[1]
						else if (keySplit[0] === "heater_generic") name = keySplit[1]

						if (value.temperature) this.commit('printer/tempHistory/addValue', { name: name, value: value.temperature, time: now })
						else if (key in state && 'temperature' in state[key]) this.commit('printer/tempHistory/addValue', { name: name, value:  state[key].temperature, time: now })

						if (value.target) this.commit('printer/tempHistory/addValue', { name: name+'_target', value: value.target, time: now })
						else if (key in state && 'target' in state[key]) this.commit('printer/tempHistory/addValue', { name: name+'_target', value:  state[key].target, time: now })
					}
				}
			}
		})
	},

	setHelplist(state, payload) {
		let helplist = [];

		for (let [command, description] of Object.entries(payload)) {
			helplist.push({
				'commandLow': command.toLowerCase(),
				'command': command,
				'description': description,
			})
		}

		Vue.set(state, "helplist", helplist)
	},

	clearCurrentFile(state) {
		Object.assign(state.current_file, {})
	},

	setEndstopStatus(state, payload) {
		delete payload.requestParams;

		Vue.set(state, 'endstops', payload);
	},

	removeBedMeshProfile(state, payload) {
		if ('bed_mesh '+payload.name in state.configfile.config) {
			Object.assign(state.configfile.config['bed_mesh '+payload.name], { deleted: true })
		}
	}
}