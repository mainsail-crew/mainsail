import Vue from "vue";
import {ActionTree} from "vuex";
import {GuiState} from "@/store/gui/types";
import {RootState} from "@/store/types";

export const actions: ActionTree<GuiState, RootState> = {
	reset({ commit }) {
		commit('reset')
	},

	init({ commit, dispatch, rootState }, payload) {
		commit('setData', payload.value)

		// init remote printers, when remoteMode is off
		if (!rootState.socket?.remoteMode) dispatch('farm/readStoredPrinters', {}, { root: true })

		dispatch('printer/init', null, { root: true })
	},

	updateDataFromDB({ state, commit }, payload) {
		commit('saveSetting', {
			name: payload.key,
			value: payload.value
		})
	},

	saveSetting({ commit }, payload) {
		commit('saveSetting', payload)

		Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: payload.name, value: payload.value }, 'gui/updateDataFromDB')
	},

	updateSettings(_, payload) {
		const keyName = payload.keyName
		let newState = payload.newVal
		if (
			'value' in payload &&
			keyName in payload.value &&
			typeof payload.value[keyName] !== "string" &&
			!Array.isArray(payload.value[keyName])
		) newState = Object.assign(payload.value[keyName], {...newState})

		Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: keyName, value: newState }, 'gui/updateDataFromDB')
	},

	setGcodefilesMetadata({ commit, dispatch, state }, data) {
		commit('setGcodefilesMetadata', data)
		dispatch('updateSettings', {
			keyName: 'gcodefiles',
			newVal: state.gcodefiles
		})
	},

	setGcodefilesShowHiddenFiles({ commit, dispatch, state }, data) {
		commit('setGcodefilesShowHiddenFiles', data)
		dispatch('updateSettings', {
			keyName: 'gcodefiles',
			newVal: state.gcodefiles
		})
	},

	addPreset({ commit, dispatch, state }, payload) {
		commit("addPreset", payload)
		dispatch('updateSettings', {
			keyName: 'presets',
			newVal: state.presets
		})
	},

	updatePreset({ commit, dispatch, state }, payload) {
		commit("updatePreset", payload)
		dispatch('updateSettings', {
			keyName: 'presets',
			newVal: state.presets
		})
	},

	deletePreset({ commit, dispatch, state }, payload) {
		commit("deletePreset", payload)
		dispatch('updateSettings', {
			keyName: 'presets',
			newVal: state.presets
		})
	},

	addConsoleFilter({ commit, dispatch, state }, payload) {
		commit("addConsoleFilter", payload)
		dispatch('updateSettings', {
			keyName: 'console.customFilters',
			newVal: state.console.customFilters
		})
	},

	updateConsoleFilter({ commit, dispatch, state }, payload) {
		commit("updateConsoleFilter", payload)
		dispatch('updateSettings', {
			keyName: 'console.customFilters',
			newVal: state.console.customFilters
		})
	},

	deleteConsoleFilter({ commit, dispatch, state }, payload) {
		commit("deleteConsoleFilter", payload)
		dispatch('updateSettings', {
			keyName: 'console.customFilters',
			newVal: state.console.customFilters
		})
	},

	addWebcam({ commit, dispatch, state }, payload) {
		commit("addWebcam", payload)
		dispatch('updateSettings', {
			keyName: 'webcam.configs',
			newVal: state.webcam.configs
		})
	},

	updateWebcam({ commit, dispatch, state }, payload) {
		commit("updateWebcam", payload)
		dispatch('updateSettings', {
			keyName: 'webcam.configs',
			newVal: state.webcam.configs
		})
	},

	deleteWebcam({ commit, dispatch, state }, payload) {
		commit("deleteWebcam", payload)
		dispatch('updateSettings', {
			keyName: 'webcam.configs',
			newVal: state.webcam.configs
		})
	},

	setTempchartDatasetAdditionalSensorSetting({ commit, dispatch, state }, payload) {
		commit("setTempchartDatasetAdditionalSensorSetting", payload)
		dispatch('updateSettings', {
			keyName: 'tempchart',
			newVal: state.tempchart
		})
	},

	resetMoonrakerDB() {
		Vue.$socket.emit('server.database.list', { }, 'gui/resetMoonrakerDB2')
	},

	resetMoonrakerDB2(_, payload) {
		if ('namespaces' in payload && payload.namespaces.includes('mainsail')) {
			Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail' }, 'gui/resetMoonrakerDB3')
		}
	},

	resetMoonrakerDB3(_, payload) {
		if ('value' in payload && Object.keys(payload.value).length) {
			Object.keys(payload.value).forEach(key => {
				Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: key })
			})

			window.location.reload()
		}
	},

	setHistoryColumns({ commit, dispatch, state }, data) {
		commit('setHistoryColumns', data)
		dispatch('updateSettings', {
			keyName: 'history',
			newVal: state.history
		})
	},
}