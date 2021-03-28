import Vue from 'vue'
import { getDefaultState } from './index'

export default {
	reset(state) {
		const defaultState = getDefaultState()

		for (const key of Object.keys(state)) {
			if (!(key in defaultState) && key !== "tempHistory") {
				delete state[key]
			}
		}

		for (const [key, value] of Object.entries(defaultState)) {
			Vue.set(state, key, value)
		}

		this.dispatch('socket/clearLoadings', null, { root: true })
		if (this.state.server.components.includes("update_manager"))
			Vue.prototype.$socket.sendObj('machine.update.status', { refresh: false }, 'server/updateManager/getStatus')
	},

	setData(state, payload) {
		if ("status" in payload) payload = payload.status;
		if ("requestParams" in payload) delete payload.requestParams
		//let now = Date.now();

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