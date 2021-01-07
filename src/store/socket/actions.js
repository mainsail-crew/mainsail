export default {
	reset({ commit }) {
		commit('reset')
	},

	onOpen ({ commit, dispatch }) {
		commit('setConnected')
		dispatch('server/init', null, { root: true })
	},

	onClose ({ commit }, event) {
		commit('setDisconnected');

		if (event.wasClean) window.console.log('Socket closed clear')
	},

	onMessage ({ commit, state }, payload) {
		if (!state.isConnected) commit('setConnected')

		switch(payload.method) {
			case 'notify_status_update':
				commit('printer/setData', payload.params[0], { root: true })
				break

			case 'notify_gcode_response':
				commit('server/addEvent', Object.assign({ result: payload.params[0] }, { send: false }), { root: true })
				break

			case 'notify_klippy_ready':
				commit('server/setKlippyReady', null, { root: true })
				break

			case 'notify_klippy_disconnected':
				commit('server/setKlippyDisconnected', null, { root: true })
				break

			case 'notify_filelist_changed':
				switch(payload.params[0].action) {
					case 'upload_file':
						commit('files/setUploadFile', payload.params[0], { root: true })
						break

					case 'delete_file':
						commit('files/setDeleteFile', payload.params[0], { root: true })
						break

					case 'move_item':
						commit('files/setMoveItem', payload.params[0], { root: true })
						break

					case 'create_dir':
						commit('files/setCreateDir', payload.params[0], { root: true })
						break

					case 'delete_dir':
						commit('files/setDeleteDir', payload.params[0], { root: true })
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

			default:
				if (payload.result !== "ok") {
					if (
						payload.error &&
						payload.error.message !== "Klippy Request Timed Out" &&
						payload.error.message !== "Klippy Disconnected"
					) window.console.error("JSON-RPC: " + payload.error.message)
					else if (!payload.error) window.console.log(payload)
				}
		}
	},

	removeLoading({ commit }, payload) {
		commit('removeLoading', payload)
	},

	clearLoadings({ commit }) {
		commit('clearLoadings')
	},

	reportDebug({ commit }, payload) {
		window.console.log(payload)
		commit('void', {}, { root: true })
	},
}