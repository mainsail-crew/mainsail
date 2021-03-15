import Vue from 'vue'
import { getDefaultState } from './index'

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	resetData(state) {
		Object.assign(state.data, getDefaultState().data)
	},

	setSocketData (state, payload) {
		if ("status" in payload) payload = payload.status;
		if ("requestParams" in payload) delete payload.requestParams
		if ("_namespace" in payload) {
			Vue.set(state, "_namespace", payload._namespace)
			delete payload._namespace
		}

		Object.entries(payload).forEach(([key, value]) => {
			Vue.set(state.socket, key, value)
		})
	},

	setData(state, payload) {
		if ("status" in payload) payload = payload.status
		if ("requestParams" in payload) delete payload.requestParams

		Object.entries(payload).forEach(([key, value]) => {
			if (key === "print_stats" && 'filename' in value) {
				this.dispatch("farm/"+state._namespace+"/sendObj", {
					method: "server.files.metadata",
					params: {filename: value.filename},
					action: "getMetadataCurrentFile"
				});
			}

			if (typeof (value) === "object") {
				Vue.set(state.data, key, {
					...state.data[key],
					...value
				})
			} else Vue.set(state.data, key, value)
		})
	},

	addWsData(state, payload) {
		state.socket.wsData.push(payload)
	},

	setCurrentFile(state, payload) {
		if ("requestParams" in payload) delete payload.requestParams
		Vue.set(state, 'current_file', payload)
	},

	setConfigDir(state, payload) {
		for (const [, file] of Object.entries(payload)) {
			if ("filename" in file) {
				if (file.filename.startsWith(".theme/")) {
					state.theme_files.push(file.filename)
				}
			}
		}
	},

	notifyFilelistChanged( state, payload) {
		if (
			payload.action === "upload_file" &&
			payload.item.root === "config" &&
			payload.item.path === ".mainsail.json"
		) {
			fetch('//'+state.socket.hostname+':'+state.socket.port+'/server/files/config/.mainsail.json?time='+Date.now())
				.then(res => res.json()).then(file => {
				this.commit("farm/"+state._namespace+"/setMainsailJson", file)
			})
		}
	},

	setDatabases(state, payload) {
		Vue.set(state, 'databases', payload.namespaces)
	},

	setMainsailData(state, payload) {
		Vue.set(state.data, 'gui', payload)
	},
}