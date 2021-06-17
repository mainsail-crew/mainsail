import Vue from 'vue'
import {ActionTree} from "vuex"
import {SocketState} from "@/store/socket/types"
import {RootState} from "@/store/types";

export const actions: ActionTree<SocketState, RootState> = {
	reset({ commit }) {
		commit('reset')
	},

	setData({ commit }, payload) {
		window.console.log(payload)
		commit('setData', payload)
	},

	setSocket({ commit, state }, payload) {
		commit('setData', payload)

		if ('$socket' in Vue.prototype) {
			Vue.prototype.$socket.close()
			Vue.prototype.$socket.setUrl(state.protocol+"://"+payload.hostname+":"+payload.port+"/websocket")
			Vue.prototype.$socket.connect()
		}
	},

	onOpen ({ commit, dispatch, rootState }) {
		//set socket connection to connected
		commit('setConnected')

		// init server
		dispatch('server/init', null, { root: true })

		if (!rootState?.server?.updateManager?.updateResponse.complete)
			commit('server/updateManager/setStatus', { busy: false }, { root: true })
	},

	onClose ({ commit }, event) {
		commit('setDisconnected')

		if (event.wasClean) {
			window.console.log('Socket closed clear')
		}
	},

	onMessage ({ commit, dispatch }, payload) {
		switch(payload.method) {
			case 'notify_status_update':
				commit('printer/setData', payload.params[0], { root: true })
				break

			case 'notify_gcode_response':
				commit('server/addEvent', Object.assign({ result: payload.params[0] }, { send: false }), { root: true })
				break

			case 'notify_klippy_ready':
				dispatch('printer/reset', null, { root: true })
				dispatch('printer/init', null, { root: true })
				break

			case 'notify_klippy_disconnected':
				commit('server/setKlippyDisconnected', null, { root: true })
				break

			case 'notify_klippy_shutdown':
				commit('server/setKlippyShutdown', null, { root: true })
				break

			case 'notify_proc_stat_update':
				commit('server/setProcStats', payload.params[0], { root: true })
				break

			case 'notify_filelist_changed':
				switch(payload.params[0].action) {
					case 'create_file':
						commit('files/setCreateFile', payload.params[0], { root: true })
						break

					case 'move_file':
						commit('files/setMoveFile', payload.params[0], { root: true })
						break

					case 'delete_file':
						commit('files/setDeleteFile', payload.params[0], { root: true })
						break

					case 'modify_file':
						commit('files/setModifyFile', payload.params[0], { root: true })
						break

					case 'create_dir':
						commit('files/setCreateDir', payload.params[0], { root: true })
						break

					case 'move_dir':
						commit('files/setMoveDir', payload.params[0], { root: true })
						break

					case 'delete_dir':
						commit('files/setDeleteDir', payload.params[0], { root: true })
						break

					case 'root_update':
						dispatch('server/addRootDirectory', payload.params[0], { root: true })
						commit('files/setRootUpdate', payload.params[0], { root: true })
						break

					default:
						window.console.error("Unknown filelist_changed action: "+payload.params[0].action)
						break
				}
				break;

			case 'notify_metadata_update':
				commit('files/setMetadata', payload.params[0], { root: true })
				break

			case 'notify_power_changed':
				commit('server/power/setStatus', payload.params[0], { root: true })
				break

			case 'notify_update_response':
				commit('server/updateManager/addUpdateResponse', payload.params[0], { root: true })
				break

			case 'notify_update_refreshed':
				commit('server/updateManager/setStatus', payload.params[0], { root: true })
				break

			case 'notify_history_changed':
				dispatch('server/history/getChanged', payload.params[0], { root: true })
				break

			default:
				if (payload.result !== "ok" && payload.error?.message) window.console.error("JSON-RPC: " + payload.error.message)
				else window.console.debug(payload)
		}
	},

	removeLoading({ commit }, payload: string) {
		commit('removeLoading', payload)
	},

	clearLoadings({ commit }) {
		commit('clearLoadings')
	},

	reportDebug(_, payload) {
		window.console.log(payload)
	},
}