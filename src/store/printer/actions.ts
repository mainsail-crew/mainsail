import Vue from 'vue'
import {ActionTree} from "vuex"
import {PrinterState} from "@/store/printer/types"
import {RootState} from "@/store/types";

export const actions: ActionTree<PrinterState, RootState> = {
	reset({ commit }) {
		commit('reset')
		commit('tempHistory/reset')
		commit('socket/clearLoadings', null, { root: true })
	},

	init() {
		window.console.debug("init printer")

		Vue.$socket.emit('printer.info', {}, 'printer/getInfo')
	},

	getInfo({ commit }, payload) {
		commit('server/setData', {
			klippy_state: payload.state,
			klippy_message: payload.state_message,
		}, { root: true })

		commit('setData', {
			hostname: payload.hostname,
			software_version: payload.software_version,
			cpu_info: payload.cpu_info,
		})

		Vue.$socket.emit('printer.objects.list', {}, 'printer/initSubscripts')
		Vue.$socket.emit('printer.gcode.help', {}, 'printer/initHelpList')
	},

	getStateMessage({ commit }, payload) {
		commit('server/setData', {
			klippy_message: payload.state_message,
		}, { root: true })
	},

	initSubscripts(_, payload) {
		let subscripts = {}
		const blocklist = [
			"gcode_macro",
			"menu",
		]

		payload.objects.forEach((key: string) => {
			const nameSplit = key.split(" ")

			if (!blocklist.includes(nameSplit[0])) subscripts = {...subscripts, [key]: null }
		})

		if (subscripts !== {}) Vue.$socket.emit('printer.objects.subscribe', { objects: subscripts }, "printer/getData")
		Vue.$socket.emit("server.temperature_store", {}, "printer/tempHistory/init")
	},

	getData({ commit }, payload) {
		if ("status" in payload) payload = payload.status
		if ("requestParams" in payload) delete payload.requestParams

		const webhooks = Object.keys(payload).findIndex(element => element === 'webhooks')
		if (webhooks !== -1) {
			this.dispatch("server/getData", { klippy_state: payload['webhooks'].state, klippy_message: payload['webhooks'].state_message }, { root: true })
			delete payload.webhooks
		}

		commit('setData', payload)
	},

	initHelpList({ commit }, payload) {
		commit('setHelplist', payload)
	},

	getEndstopStatus({ commit }, payload) {
		commit('socket/removeLoading', { name: 'queryEndstops' }, { root: true });
		commit('setEndstopStatus', payload);
	},

	removeBedMeshProfile({ commit }, payload) {
		commit('socket/removeLoading', { name: 'bedMeshRemove_'+payload.name }, { root: true })
		commit('removeBedMeshProfile', payload)
	},

	sendGcode({ commit }, payload) {
		commit('socket/addLoading', { name: 'sendGcode' }, { root: true })
		commit('server/addEvent', { message: payload, type: 'command' }, { root: true })

		if (payload.toLowerCase().trim() === "m112") {
			Vue.$socket.emit('printer.emergency_stop', {}, "socket/removeLoading", { name: 'sendGcode' })
		} else {
			Vue.$socket.emit('printer.gcode.script', { script: payload }, "socket/removeLoading", { name: 'sendGcode' })
		}
	}
}