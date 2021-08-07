import Vue from 'vue'
import { getDefaultState } from './index'
import {MutationTree} from "vuex";
import {FarmPrinterState} from "@/store/farm/printer/types";

export const mutations: MutationTree<FarmPrinterState> = {
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
			if (typeof (value) === "object") {
				Vue.set(state.data, key, {
					...state.data[key],
					...value
				})
			} else Vue.set(state.data, key, value)
		})
	},

	setSettings(state, payload) {
		Vue.set(state, 'settings', {
			...state.settings,
			...payload
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
		Object.values(payload).forEach((file: any) => {
			if ("filename" in file) {
				if (file.filename.startsWith(".theme/")) {
					state.theme_files.push(file.filename)
				}
			}
		})
	},

	setDatabases(state, payload) {
		Vue.set(state, 'databases', payload.namespaces)
	},

	setMainsailData(state, payload) {
		const setDataDeep = (currentState: any, payload: any) => {
			Object.entries(payload).forEach(([key, value]) => {
				if (typeof value === 'object' && !Array.isArray(value) && key in currentState) {
					setDataDeep(currentState[key], value)
				} else if (key in currentState) {
					Vue.set(currentState, key, value)
				}
			})
		}

		setDataDeep(state.data.gui, payload)
	},
}