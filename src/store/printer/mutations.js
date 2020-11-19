import Vue from 'vue'
import { getDefaultState } from './index'

export default {
	reset(state) {
		window.console.log("printer/reset");
		Object.assign(state, getDefaultState)
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
					let keySplit = key.split(" ");

					if (
						state.heaters.available_heaters.includes(key) ||
						keySplit[0] === "temperature_fan" ||
						keySplit[0] === "temperature_sensor") {

						if (keySplit[0] === "temperature_fan") key = keySplit[1];
						else if (keySplit[0] === "temperature_sensor") key = keySplit[1];
						else if (keySplit[0] === "heater_generic") key = keySplit[1];

						this.commit('printer/tempHistory/addValue', { name: key, value: value, time: now });
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
}