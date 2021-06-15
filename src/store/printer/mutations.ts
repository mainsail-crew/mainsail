import Vue from 'vue'
import { getDefaultState } from './index'
import {MutationTree} from "vuex";
import {PrinterState} from "@/store/printer/types";

export const mutations: MutationTree<PrinterState> = {
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

		if (state.server.components.includes("update_manager"))
			Vue.$socket.emit('machine.update.status', { refresh: false }, 'server/updateManager/getStatus')
	},

	setData(state, payload) {
		Object.entries(payload).forEach(([key, value]) => {
			if (typeof (value) === "object") {
				Vue.set(state, key, {
					...state[key],
					...value
				})
			} else Vue.set(state, key, value)
		})
	},

	setHelplist(state, payload) {
		const helplist = [];

		for (const [command, description] of Object.entries(payload)) {
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